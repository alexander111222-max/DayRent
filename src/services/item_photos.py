from src.schemas.item_photos import ItemPhotosAddSchema
from src.services.base import BaseService


class ItemPhotosService(BaseService):
    def __init__(self, db):
        super().__init__(db)

    async def add_one(self, data: ItemPhotosAddSchema):
        item_photo = await self._db.item_photos.add_one(data)
        return item_photo



