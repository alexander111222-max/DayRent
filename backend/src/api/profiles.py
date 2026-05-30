from fastapi import APIRouter, HTTPException

from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.models.bookings import StatusEnum
from backend.src.schemas.users import UserPatchSchema
from backend.src.services.bookings import BookingsService
from backend.src.services.items import ItemsService
from backend.src.services.users import UserService
import logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["profiles"])


@router.get("/")
async def get_profile(db: DBDep, user_id: user_idDep):

    user = await UserService(db).get_user(id=user_id)
    items = await ItemsService(db).get_items_by_user_id(user_id)
    return {"user": user,
            "items": items}



@router.patch("/modify")
async def modify_profile(data: UserPatchSchema, user_id: user_idDep, db: DBDep):

    modified_user = await UserService(db).modify_user(data, user_id, id=user_id)
    logger.debug(f"Произошло изменение профиля с user_id: {user_id}")
    return modified_user


@router.get("/active")
async def get_active_bookings(db: DBDep, user_id: user_idDep):

    bookings = await BookingsService(db).get_bookings_by_filter(rent_id=user_id, status=StatusEnum.ACTIVE)
    return bookings

@router.get("/completed")
async def get_completed_bookings(db: DBDep, user_id: user_idDep):

    bookings = await BookingsService(db).get_bookings_by_filter(rent_id=user_id, status=StatusEnum.COMPLETED)
    return bookings
