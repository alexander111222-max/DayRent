from datetime import date, datetime
from typing import List

from pydantic import BaseModel


class DocumentIn(BaseModel):
    title: str
    description: str
    city: str
    category_id: int
    location: dict | None = None
    price: int
    created_at: date


class DocumentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    city: str | None = None
    category_id: int | None = None
    location: dict | None = None
    price: int | None = None
    created_at: date | None = None

class Location(BaseModel):
    lat: float | None
    lon: float | None

class SearchRequestSchema(BaseModel):
    query: str | None = None

    price_from: int | None = None
    price_to: int | None = None

    city: str | None = None
    category_id: int | None = None
    location: Location | None = None
    nearby: bool | None = None


class SearchHit(BaseModel):
    id: str
    score: float
    title: str
    description: str
    city: str
    price: int
    created_at: datetime



class SearchResponse(BaseModel):
    total: int
    results: List[SearchHit]