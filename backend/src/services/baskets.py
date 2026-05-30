from backend.src.schemas.baskets import BasketAddSchema
from backend.src.services.base import BaseService
from backend.src.utils.exceptions import ItemNotFoundException, ItemInBasketNotFoundException


class BasketsService(BaseService):

    def __init__(self, db):
        super().__init__(db)


    async def add_to_basket(self, data: BasketAddSchema):
        result = await self._db.baskets.add_one(data)
        await self._db.commit()
        return result

    async def get_basket_by_user_id(self, user_id: int):
        result = await self._db.baskets.get_basket_by_user_id(user_id)
        return result



    async def delete(self, *filters, **filter_by):

        deleted = await self._db.baskets.delete(*filters, **filter_by)
        if deleted is None:
            raise ItemInBasketNotFoundException
        await self._db.commit()
        return deleted