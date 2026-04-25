from datetime import date

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