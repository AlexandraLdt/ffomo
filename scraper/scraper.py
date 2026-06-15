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
from datetime import datetime, date

from dotenv import load_dotenv
load_dotenv(override=True)

import anthropic
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

HTML (truncated to 60000 chars):
{html}
"""


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


def extract_events_with_claude(html: str, base_url: str) -> list[dict]:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = EXTRACT_PROMPT.format(
        today=date.today().isoformat(),
        base_url=base_url,
        html=html[:60000],
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
        # Try to salvage partial JSON by truncating at the last complete object
        last_complete = raw.rfind("},")
        if last_complete != -1:
            raw = raw[:last_complete+1] + "]"
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                pass
        log.warning(f"Could not parse Claude response as JSON for {base_url}")
        return []


def upsert_events(db, venue_id: str, events: list[dict]):
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
            "scraped_at": datetime.utcnow().isoformat(),
        }
        db.table("events").upsert(record, on_conflict="venue_id,title,start_date").execute()


async def scrape_venue(db, venue: dict):
    log.info(f"Scraping {venue['name']} ...")
    try:
        html = await fetch_html(venue["url"])
        events = extract_events_with_claude(html, venue["url"])
        log.info(f"  → {len(events)} events found")
        upsert_events(db, venue["id"], events)
        db.table("venues").update({"last_scraped_at": datetime.utcnow().isoformat()}).eq("id", venue["id"]).execute()
    except Exception as e:
        log.error(f"  ✗ Failed to scrape {venue['name']}: {e}")


async def main():
    db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    with open(INSTITUTIONS_FILE) as f:
        institutions = json.load(f)

    # Fetch venue IDs from DB (to link events to DB UUIDs)
    venues_result = db.table("venues").select("id,name").execute()
    venue_map = {v["name"]: v["id"] for v in venues_result.data}

    for inst in institutions:
        inst["id"] = venue_map.get(inst["name"], inst["id"])

    # Scrape sequentially to be polite to servers
    for venue in institutions:
        await scrape_venue(db, venue)

    log.info("Scrape complete.")


if __name__ == "__main__":
    asyncio.run(main())
