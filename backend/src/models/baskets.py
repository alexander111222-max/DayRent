from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped

from backend.src.database import Base


class BasketsOrm(Base):
    __tablename__ = "baskets"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"))



