"""
One-time script to backfill image_url for events that have none.
Fetches each event's own page and extracts the og:image.
Run once: python backfill_images.py
"""

import os
import asyncio
import logging
from urllib.parse import urljoin

from dotenv import load_dotenv
load_dotenv(override=True)

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


async def fetch_og_image(url: str, browser) -> str | None:
    """Fetch a page and return its og:image URL, or None."""
    try:
        page = await browser.new_page()
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        html = await page.content()
        await page.close()
    except Exception as e:
        log.warning(f"  fetch failed for {url}: {e}")
        return None

    soup = BeautifulSoup(html, "html.parser")

    # 1. og:image — best option
    og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
    if og and og.get("content"):
        src = og["content"].strip()
        if src and not src.startswith("data:"):
            return urljoin(url, src)

    # 2. First large content image
    skip = ["logo", "icon", "avatar", "pixel", "tracking", "placeholder", "blank"]
    for img in soup.find_all("img", src=True):
        src = img["src"].strip()
        if not src or src.startswith("data:"):
            continue
        if any(t in src.lower() for t in skip):
            continue
        w = img.get("width", "")
        try:
            if int(str(w).replace("px", "")) < 150:
                continue
        except (ValueError, TypeError):
            pass
        return urljoin(url, src)

    return None


async def main():
    db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    # Fetch all events without an image that have a valid event_url
    result = db.table("events").select("id,title,event_url").is_("image_url", "null").neq("event_url", "").execute()
    events = result.data
    log.info(f"Found {len(events)} events without images")

    updated = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for ev in events:
            url = ev.get("event_url", "")
            if not url or not url.startswith("http"):
                continue
            log.info(f"  Checking: {ev['title'][:50]} — {url}")
            img_url = await fetch_og_image(url, browser)
            if img_url:
                db.table("events").update({"image_url": img_url}).eq("id", ev["id"]).execute()
                log.info(f"    ✓ Found image: {img_url[:80]}")
                updated += 1
            else:
                log.info(f"    – No image found")
        await browser.close()

    log.info(f"Done. Updated {updated}/{len(events)} events with images.")


if __name__ == "__main__":
    asyncio.run(main())
