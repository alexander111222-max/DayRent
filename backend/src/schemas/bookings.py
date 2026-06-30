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


class BookingPatchSchema(BaseModel):
    date_from: date | None = None
    date_to: date | None = None
    status: StatusEnum | None = None
    price: int | None = None
    item_id: int | None = None
    owner_id: int | None = None
    rent_id: int | None = None
    total_cost: int | None = None

    model_config = ConfigDict(from_attributes=True)