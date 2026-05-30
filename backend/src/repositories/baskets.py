from sqlalchemy import select

from backend.src.models.baskets import BasketsOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import BasketsMapper


class BasketsRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, BasketsOrm)

    mapper = BasketsMapper

    async def get_basket_by_user_id(self, user_id: int):
        query = select(self._model).where(user_id == self._model.user_id)

        result = await self._session.execute(query)

        models = result.scalars().all()


        return [self.mapper.map_to_domain_entity(model) for model in models]


