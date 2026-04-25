from typing import Optional

from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey, Numeric
from datetime import date
from backend.src.database import Base
from decimal import Decimal

class ItemsOrm(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    price: Mapped[int]
    description: Mapped[str]
    city: Mapped[str]
    address: Mapped[str]
    lat: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    lon: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"))
    created_at: Mapped[date]

