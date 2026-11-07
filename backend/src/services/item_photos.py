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




    async def get_main_photos(self, item_ids: list[int]):
        main_photos = await self._db.item_photos.get_main_photos(item_ids)
        return main_photos

    async def add_bulk(self, data: list[ItemPhotosAddSchema]):
        item_photos = await self._db.item_photos.add_bulk(data)
        await self._db.commit()
        return item_photos

    async def delete(self, *filters, **filter_by):
        delete_photo = await self._db.item_photos.delete(*filters, **filter_by)
        return delete_photo