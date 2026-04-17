from unicodedata import category

from backend.src.schemas.categories import CategoryAddSchema
from backend.src.services.base import BaseService


class CategoriesService(BaseService):
    def __init__(self, db):
        super().__init__(db)

    async def add_category(self, data: CategoryAddSchema):
        category = await self._db.categories.add_one(data)
        await self._db.commit()
        return category

    async def get_category_by_filter(self, **filter_by):
        category = await self._db.categories.get_one_or_none(**filter_by)
        return category

    async def delete_category(self, *filters, **filter_by):
        deleted_category = await self._db.categories.delete(*filters, **filter_by)
        await self._db.commit()
        return deleted_category
