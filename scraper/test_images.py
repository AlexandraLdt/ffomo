"""Test image scraping for Frankfurt Lieblingsorte only."""
import asyncio
import json
import os
from dotenv import load_dotenv
load_dotenv(override=True)

from scraper import fetch_html, strip_html, fetch_page_images, extract_events_with_claude

VENUE = {
    "id": "frankfurt-lieblingsorte",
    "name": "Frankfurt Lieblingsorte",
    "url": "https://www.frankfurtlieblingsorte.de/",
    "scrape_images": True,
}

async def main():
    print(f"Scraping: {VENUE['name']}")
    html = await fetch_html(VENUE["url"])
    text = strip_html(html)
    print(f"Page text: {len(text):,} chars")

    images = fetch_page_images(html, VENUE["url"])
    print(f"Images fetched: {len(images)}")

    events = extract_events_with_claude(html, VENUE["url"], images=images)
    print(f"\nEvents found: {len(events)}")
    for e in events:
        print(f"  • {e.get('start_date', '?')} {e.get('start_time', '') or ''} — {e.get('title', '?')}")

asyncio.run(main())
