from backend.src.schemas.item_photos import ItemPhotosAddSchema
from backend.src.services.base import BaseService


class ItemPhotosService(BaseService):
    def __init__(self, db):
        super().__init__(db)

    async def add_one(self, data: ItemPhotosAddSchema):
        item_photo = await self._db.item_photos.add_one(data)
        await self._db.commit()
        return item_photo


    async def get_filter_by(self, *filters, **filter_by):
        item_photos = await self._db.item_photos.get_filter_by(*filters, **filter_by)
        return item_photos