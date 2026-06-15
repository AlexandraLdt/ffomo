import asyncio
import json
import os
import re
from dotenv import load_dotenv

load_dotenv(override=True)


def parse_json(raw: str) -> list:
    raw = raw.strip()
    # Strip markdown code fences
    raw = re.sub(r"^```[a-zA-Z]*\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()
    start = raw.find("[")
    end = raw.rfind("]")
    if start == -1 or end == -1:
        return []
    json_str = raw[start : end + 1]
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        last = json_str.rfind("},")
        if last > 0:
            try:
                return json.loads(json_str[: last + 1] + "]")
            except Exception:
                pass
    return []


async def scrape_arthouse(page, client, sb):
    print("Scraping Arthouse Kinos Frankfurt...")
    await page.goto(
        "https://www.arthouse-kinos.de/programm-tickets/",
        timeout=30000,
        wait_until="networkidle",
    )
    await page.wait_for_timeout(4000)
    text = await page.evaluate("() => document.body.innerText")

    prompt = (
        "Extract all film screenings from this cinema program. "
        "Day headers look like 'Montag\\n08. Juni'. Today is 2026-06-08. "
        "For each unique film per day return ONE entry (first showtime). "
        "Return a JSON array: "
        '[{"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "url": "https://www.arthouse-kinos.de/programm-tickets/"}]. '
        "Only dates from 2026-06-08 onwards. Return raw JSON only, no markdown.\n\n"
        + text
    )

    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    events_data = parse_json(msg.content[0].text)
    print(f"  Found {len(events_data)} events")

    rows = [
        {
            "venue_id": "arthouse-kinos",
            "title": e["title"],
            "description": None,
            "start_date": e["date"],
            "start_time": e.get("time"),
            "event_url": "https://www.arthouse-kinos.de/programm-tickets/",
            "image_url": None,
        }
        for e in events_data
        if e.get("date") and e.get("title")
    ]
    if rows:
        sb.from_("events").upsert(rows, on_conflict="venue_id,title,start_date").execute()
        print(f"  Saved {len(rows)} events")
        print(f"  Sample: {[(r['title'], r['start_date']) for r in rows[:3]]}")


async def scrape_freiluftkino(page, client, sb):
    print("Scraping Freiluftkino Frankfurt...")
    await page.goto(
        "https://www.freiluftkinofrankfurt.de/",
        timeout=30000,
        wait_until="networkidle",
    )
    await page.wait_for_timeout(3000)
    text = await page.evaluate("() => document.body.innerText")

    prompt = (
        "Extract all upcoming open-air film screenings from this website. "
        "The season runs 26 June – 23 August 2026. Today is 2026-06-08. "
        "If no specific films are listed yet, return an empty array []. "
        "Otherwise return: "
        '[{"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM" or null, "url": "https://www.freiluftkinofrankfurt.de/"}]. '
        "Return raw JSON only.\n\n"
        + text
    )

    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    events_data = parse_json(msg.content[0].text)
    print(f"  Found {len(events_data)} events (season starts 26 Jun)")

    rows = [
        {
            "venue_id": "freiluftkino",
            "title": e["title"],
            "description": None,
            "start_date": e["date"],
            "start_time": e.get("time"),
            "event_url": "https://www.freiluftkinofrankfurt.de/",
            "image_url": None,
        }
        for e in events_data
        if e.get("date") and e.get("title")
    ]
    if rows:
        sb.from_("events").upsert(rows, on_conflict="venue_id,title,start_date").execute()
        print(f"  Saved {len(rows)} events")


async def scrape_malsehkino_upcoming(page, client, sb):
    """Mal Seh'n already has 23 events — just verify."""
    from supabase import create_client as sc
    r = sb.from_("events").select("title,start_date").eq("venue_id", "malsehkino").gte("start_date", "2026-06-08").limit(5).execute()
    print(f"Mal Seh'n Kino: {len(r.data)} upcoming events already in DB ✓")


async def main():
    import anthropic
    from supabase import create_client
    from playwright.async_api import async_playwright

    sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    client = anthropic.Anthropic()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await ctx.new_page()

        await scrape_malsehkino_upcoming(page, client, sb)
        await scrape_arthouse(page, client, sb)
        await scrape_freiluftkino(page, client, sb)

        await browser.close()


asyncio.run(main())
