from datetime import date
from typing import List

from fastapi import UploadFile

from backend.src.api.dependencies import DBDep
from backend.src.services.base import BaseService
from backend.src.schemas.items import ItemAddSchema, ItemAddRequestSchema, ItemEditSchema, CoordinateItem
from backend.src.utils.exceptions import ObjectNotFoundException, ItemNotFoundException, MultipleObjectsFoundException, \
    MultipleItemFoundException


class ItemsService(BaseService):
    def __init__(self, db):
        super().__init__(db)



    async def add_item(self, data: ItemAddRequestSchema, user_id: int):

        item = ItemAddSchema(
            **data.model_dump(),
            user_id=user_id,
            created_at=date.today()
        )

        added_item = await self._db.items.add_one(item)
        await self._db.commit()
        return added_item


    async def edit(self, data: ItemEditSchema, *filters, **filter_by):
        try:
            await self._db.items.edit(data, *filters, **filter_by)
            await self._db.commit()
        except ObjectNotFoundException:
            raise ItemNotFoundException
        except MultipleObjectsFoundException:
            raise MultipleItemFoundException

    async def update_coordinates(self, item_id: int, lat: float, lon: float):

        coor_item = CoordinateItem(
            lat=lat,
            lon=lon
        )
        await self._db.items.edit(coor_item, id=item_id)


    async def delete_item(self, *filters, **filter_by):
        deleted_item = await self._db.items.delete(*filters, **filter_by)
        await self._db.commit()
        return deleted_item
