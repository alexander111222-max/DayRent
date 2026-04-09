from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ItemSchema(BaseModel):
    id: int
    title: str
    price: int
    description: str
    city: str
    address: str
    lat: Decimal | None
    lon: Decimal | None
    user_id: int
    category_id: int
    created_at: date

    model_config = ConfigDict(from_attributes=True)


class ItemAddRequestSchema(BaseModel):
    title: str
    price: int
    description: str
    city: str
    address: str
    category_id: int
    model_config = ConfigDict(from_attributes=True)


class ItemAddSchema(BaseModel):
    title: str
    price: int
    description: str
    city: str
    address: str
    lat: Decimal | None = None
    lon: Decimal | None = None
    user_id: int
    category_id: int
    created_at: date


class ItemEditSchema(BaseModel):
    title: str | None = None
    price: int | None = None
    description: str | None = None
    city: str | None = None
    address: str | None = None
    category_id: int | None = None

class CoordinateItem(BaseModel):
    lat: Decimal
    lon: Decimal