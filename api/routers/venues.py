from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter()


@router.get("/")
def list_venues():
    db = get_db()
    result = db.table("venues").select("*").order("name").execute()
    return result.data


@router.get("/{venue_id}")
def get_venue(venue_id: str):
    db = get_db()
    result = db.table("venues").select("*").eq("id", venue_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Venue not found")
    return result.data
