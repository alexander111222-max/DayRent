from datetime import date
from backend.src.services.base import BaseService
from backend.src.schemas.items import ItemAddSchema, ItemAddRequestSchema, ItemEditSchema, CoordinateItem
from backend.src.utils.exceptions import ObjectNotFoundException, ItemNotFoundException, MultipleObjectsFoundException, \
    MultipleItemFoundException, CategoryNotFoundException, ForbiddenException


class ItemsService(BaseService):
    def __init__(self, db):
        super().__init__(db)



    async def add_item(self, data: ItemAddRequestSchema, user_id: int):

        categories = await self._db.categories.get_all()
        categories_id = [cat.id for cat in categories]
        if data.category_id not in categories_id:
            raise CategoryNotFoundException

        item = ItemAddSchema(
            **data.model_dump(),
            user_id=user_id,
            created_at=date.today()
        )

        added_item = await self._db.items.add_one(item)
        await self._db.commit()
        return added_item

    async def get_items_by_ids(self, ids: list[int]):
        items = await self._db.items.get_all_by_id(ids)
        return items


    async def edit(self, data: ItemEditSchema, user_id: int, item_id: int, *filters, **filter_by):

        if data.category_id:
            categories = await self._db.categories.get_all()
            categories_id = [cat.id for cat in categories]
            if data.category_id not in categories_id:
                raise CategoryNotFoundException

        try:
            item = await self._db.items.get_one(id=item_id)
        except ObjectNotFoundException:
            raise ItemNotFoundException
        if item.user_id != user_id:
            raise ForbiddenException


        try:
            edited_item = await self._db.items.edit(data, *filters, **filter_by)
            await self._db.commit()
        except ObjectNotFoundException:
            raise ItemNotFoundException
        except MultipleObjectsFoundException:
            raise MultipleItemFoundException

        return edited_item

    async def update_coordinates(self, item_id: int, lat: float, lon: float):

        coor_item = CoordinateItem(
            lat=lat,
            lon=lon
        )
        await self._db.items.edit(coor_item, id=item_id)
        await self._db.commit()



    async def delete_item(self,user_id: int, item_id: int):
        try:
            item = await self._db.items.get_one(id=item_id)
        except ObjectNotFoundException:
            raise ItemNotFoundException

        if item.user_id != user_id:
            raise ForbiddenException

        deleted_item = await self._db.items.delete(id=item_id)
        await self._db.commit()
        return deleted_item


    async def get_items_by_user_id(self, user_id: int):
        items = await self._db.items.get_filter_by(user_id=user_id)
        return items