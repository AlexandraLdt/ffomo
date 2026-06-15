from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from uuid import UUID


class Venue(BaseModel):
    id: UUID
    name: str
    url: str
    category: str  # lectures | culture | activities | cinema
    image_url: Optional[str] = None
    last_scraped_at: Optional[str] = None


class Event(BaseModel):
    id: UUID
    venue_id: UUID
    venue_name: str
    category: str
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    start_time: Optional[str] = None
    event_url: str
    image_url: Optional[str] = None
    scraped_at: Optional[str] = None
