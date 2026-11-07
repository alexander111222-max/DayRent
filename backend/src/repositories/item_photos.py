from sqlalchemy import select

from backend.src.models.item_photos import ItemPhotosOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import ItemPhotosMapper


class ItemPhotosRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, ItemPhotosOrm)

    mapper = ItemPhotosMapper


    async def get_main_photos(self, item_ids: list[int]):

        query = select(self._model.item_id, self._model.id).filter(
            self._model.item_id.in_(item_ids),
                    self._model.is_main.is_(True)
        )

        res = await self._session.execute(query)
        return {item_id: photo_id for item_id, photo_id in res.all()}


