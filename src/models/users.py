
from sqlalchemy.orm import Mapped, mapped_column
from decimal import Decimal
from src.database import Base


class UsersOrm(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str]
    surname: Mapped[str]
    age: Mapped[int]
    phone: Mapped[str]
    email: Mapped[str]
    city: Mapped[str]
    address: Mapped[str]
    lat: Mapped[Decimal]
    lon: Mapped[Decimal]
