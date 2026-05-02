from sqlalchemy import select

from backend.src.models.baskets import BasketsOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import BasketsMapper


class BasketRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, BasketsOrm)

    mapper = BasketsMapper

    async def get_basket(self, user_id: int, item_id: int):
        query = select(Ite)