from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import get_db

router = APIRouter()


@router.get("/")
def list_events(
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    category: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
):
    db = get_db()
    query = db.table("events").select(
        "*, venues(name, category, url)"
    ).order("start_date").limit(limit)

    if date:
        query = query.eq("start_date", date)
    else:
        today = __import__("datetime").date.today().isoformat()
        query = query.gte("start_date", from_date or today)
        if to_date:
            query = query.lte("start_date", to_date)

    if category:
        # Join through venues table
        query = query.eq("venues.category", category)

    result = query.execute()
    return result.data


@router.get("/{event_id}")
def get_event(event_id: str):
    db = get_db()
    result = db.table("events").select("*, venues(name, category, url)").eq("id", event_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return result.data
