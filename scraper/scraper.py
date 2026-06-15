"""
FFOMO Daily Scraper
-------------------
Scrapes each institution's events page using Playwright to load the page,
then uses the Claude API to extract structured event data from the HTML.
Run daily via cron:  0 6 * * * python scraper.py
"""

import os
import json
import asyncio
import logging
import uuid
from datetime import datetime, date, timezone

from dotenv import load_dotenv
load_dotenv(override=True)

import anthropic
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

INSTITUTIONS_FILE = os.path.join(os.path.dirname(__file__), "institutions.json")

EXTRACT_PROMPT = """You are extracting upcoming events from a Frankfurt cultural institution's website.

Given the HTML of an events page, extract ALL upcoming events and return them as a JSON array.
Today's date is {today}.

For each event return:
{{
  "title": "Event title",
  "description": "Short description (1–3 sentences, null if not available)",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD or null",
  "start_time": "HH:MM or null",
  "event_url": "Direct URL to the event detail page (use the base_url if only relative paths are found)",
  "image_url": "Absolute image URL or null"
}}

Rules:
- Only include events with a valid start_date in the future (>= today).
- Return an empty array [] if no upcoming events are found.
- Return ONLY the JSON array, no markdown, no explanation.

Base URL of the page: {base_url}

Page text content (truncated to 60000 chars):
{html}
"""


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


async def fetch_html(url: str) -> str:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)  # let any lazy-loaded content settle
            html = await page.content()
        finally:
            await browser.close()
    return html


def strip_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "head", "nav", "footer", "iframe", "noscript"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    # Collapse runs of whitespace
    import re
    return re.sub(r"\s{2,}", " ", text)


def extract_events_with_claude(html: str, base_url: str) -> list[dict]:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = EXTRACT_PROMPT.format(
        today=date.today().isoformat(),
        base_url=base_url,
        html=strip_html(html)[:60000],
    )
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    # Strip markdown code fences if present
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    # Find the JSON array even if there's surrounding text
    start = raw.find("[")
    end = raw.rfind("]")
    if start != -1 and end != -1:
        raw = raw[start:end+1]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        last_complete = raw.rfind("},")
        if last_complete != -1:
            raw = raw[:last_complete+1] + "]"
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                pass
        log.warning(f"Could not parse Claude response as JSON for {base_url}")
        return []


def upsert_events(db, venue_id: str, events: list[dict]) -> tuple[int, int]:
    """Returns (new_events, updated_events)."""
    new_count = 0
    updated_count = 0

    # Fetch existing (title, start_date) pairs for this venue to detect new vs updated
    existing = db.table("events").select("title,start_date").eq("venue_id", venue_id).execute()
    existing_keys = {(r["title"], r["start_date"]) for r in existing.data}

    for ev in events:
        if not ev.get("start_date") or not ev.get("title"):
            continue
        record = {
            "venue_id": venue_id,
            "title": ev["title"],
            "description": ev.get("description"),
            "start_date": ev["start_date"],
            "end_date": ev.get("end_date"),
            "start_time": ev.get("start_time"),
            "event_url": ev.get("event_url", ""),
            "image_url": ev.get("image_url"),
            "scraped_at": now_utc(),
        }
        db.table("events").upsert(record, on_conflict="venue_id,title,start_date").execute()

        if (ev["title"], ev["start_date"]) in existing_keys:
            updated_count += 1
        else:
            new_count += 1

    return new_count, updated_count


async def scrape_venue(db, venue: dict, run_id: str):
    log.info(f"Scraping {venue['name']} ...")
    error = None
    events_found = 0
    new_events = 0
    updated_events = 0

    try:
        html = await fetch_html(venue["url"])
        events = extract_events_with_claude(html, venue["url"])
        events_found = len(events)
        log.info(f"  → {events_found} events found")
        new_events, updated_events = upsert_events(db, venue["id"], events)
        db.table("venues").update({"last_scraped_at": now_utc()}).eq("id", venue["id"]).execute()
    except Exception as e:
        error = str(e)
        log.error(f"  ✗ Failed to scrape {venue['name']}: {e}")

    db.table("scraper_logs").insert({
        "run_id": run_id,
        "venue_id": venue["id"],
        "venue_name": venue["name"],
        "events_found": events_found,
        "new_events": new_events,
        "updated_events": updated_events,
        "error": error,
        "scraped_at": now_utc(),
    }).execute()


async def main():
    db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    with open(INSTITUTIONS_FILE) as f:
        institutions = json.load(f)

    # Fetch venue IDs from DB (to link events to DB UUIDs)
    venues_result = db.table("venues").select("id,name").execute()
    venue_map = {v["name"]: v["id"] for v in venues_result.data}

    for inst in institutions:
        inst["id"] = venue_map.get(inst["name"], inst["id"])

    # Create a run record
    run_result = db.table("scraper_runs").insert({"started_at": now_utc()}).execute()
    run_id = run_result.data[0]["id"]
    log.info(f"Run ID: {run_id}")

    for venue in institutions:
        await scrape_venue(db, venue, run_id)

    db.table("scraper_runs").update({"finished_at": now_utc()}).eq("id", run_id).execute()
    log.info("Scrape complete.")


if __name__ == "__main__":
    asyncio.run(main())
