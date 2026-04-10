from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped

from src.database import Base


class ItemPhotosOrm(Base):
    __tablename__ = "itemPhotos"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    position: Mapped[int] # STARTED WITH 1
    is_main: Mapped[bool]
