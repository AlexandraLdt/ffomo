"""Quick test: scrape 2 institutions and print results."""
import asyncio
import json
import os
from dotenv import load_dotenv
load_dotenv(override=True)

from scraper import fetch_html, extract_events_with_claude

TEST_VENUES = [
    {"id": "staedel", "name": "Städel Museum", "url": "https://www.staedelmuseum.de/en/exhibitions-programme"},
    {"id": "polytechnische", "name": "Polytechnische Gesellschaft", "url": "https://polytechnische.de/veranstaltungen"},
]

async def main():
    for venue in TEST_VENUES:
        print(f"\n{'='*60}")
        print(f"Scraping: {venue['name']}")
        print(f"URL: {venue['url']}")
        print('='*60)
        try:
            html = await fetch_html(venue["url"])
            print(f"✓ Page loaded ({len(html):,} characters of HTML)")
            events = extract_events_with_claude(html, venue["url"])
            print(f"✓ Claude found {len(events)} events:")
            for e in events[:5]:  # show first 5
                print(f"  • {e.get('start_date', '?')} — {e.get('title', '?')}")
            if len(events) > 5:
                print(f"  ... and {len(events)-5} more")
        except Exception as e:
            print(f"✗ Error: {e}")

asyncio.run(main())
