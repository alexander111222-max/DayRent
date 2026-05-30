from datetime import date

from pydantic import BaseModel, ConfigDict

from backend.src.models.bookings import StatusEnum


class BookingsAddSchema(BaseModel):
    date_from: date
    date_to: date
    status: StatusEnum
    price: int
    item_id: int
    owner_id: int
    rent_id: int


class BookingsAddRequestSchema(BaseModel):
    date_from: date
    date_to: date
    price: int
    item_id: int
    owner_id: int



class BookingSchema(BaseModel):
    id: int
    date_from: date
    date_to: date
    status: StatusEnum
    price: int
    item_id: int
    owner_id: int
    rent_id: int
    total_cost: int

    model_config = ConfigDict(from_attributes=True)
