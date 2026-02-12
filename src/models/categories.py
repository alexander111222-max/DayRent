
from sqlalchemy.orm import mapped_column, Mapped

from src.database import Base


class CategoriesOrm(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]


