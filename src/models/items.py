
from sqlalchemy.orm import mapped_column, Mapped
from datetime import date
from src.database import Base
from decimal import Decimal

class ItemsOrm(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    price: Mapped[int]
    description: Mapped[str]
    city: Mapped[str]
    address: Mapped[str]
    lat: Mapped[Decimal]
    lon: Mapped[Decimal]
    user_id: Mapped[int] = mapped_column(foreign_key="users.id")
    category_id: Mapped[int] = mapped_column(foreign_key="categories.id")
    created_at: Mapped[date]