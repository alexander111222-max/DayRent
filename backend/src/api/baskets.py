
from fastapi import APIRouter, HTTPException

from backend.src.api.dependencies import user_idDep, DBDep
from backend.src.schemas.baskets import BasketAddSchema
from backend.src.services.baskets import BasketsService
from backend.src.utils.exceptions import ItemInBasketNotFoundException
import logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/basket", tags=["Понравившиеся/корзина"])


@router.get("/")
async def get_basket(db: DBDep, user_id: user_idDep):

    basket = await BasketsService(db).get_basket_by_user_id(user_id)
    return basket

@router.post("/")
async def add_to_basket(db: DBDep, item_id: int, user_id: user_idDep):
    item_in_basket = await BasketsService(db).add_to_basket(BasketAddSchema(item_id=item_id, user_id=user_id))
    return item_in_basket

@router.delete("/")
async def delete_from_basket(item_id: int, user_id: user_idDep, db: DBDep):

    try:
        deleted_item = await BasketsService(db).delete(item_id=item_id, user_id=user_id)
    except ItemInBasketNotFoundException:
        logger.warning("Удаление несуществующей вещи")
        raise HTTPException(status_code=404, detail="Такой вещи не найдено")
    return deleted_item



