from enum import Enum

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.src.database import Base

class PhotoSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    ORIGINAL = "original"


class PhotosUrlOrm(Base):
    __tablename__ = "photosUrl"
    id: Mapped[int] = mapped_column(primary_key=True)
    photo_id: Mapped[int] = mapped_column(ForeignKey("itemPhotos.id"))
    size: Mapped[PhotoSize]
    url: Mapped[str]
