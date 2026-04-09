from enum import Enum


from datetime import date

from sqlalchemy import ForeignKey
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import mapped_column, Mapped

from src.database import Base


class StatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    CANCELLED = "cancelled"



class BookingsOrm(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    date_from: Mapped[date]
    date_to: Mapped[date]
    status: Mapped[StatusEnum]
    price: Mapped[int]
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    rent_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    @hybrid_property
    def total_cost(self):
        return self.price * ((self.date_to - self.date_from).days)


