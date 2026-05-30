from fastapi import APIRouter, HTTPException

from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.models.bookings import StatusEnum
from backend.src.schemas.bookings import BookingsAddRequestSchema
from backend.src.services.bookings import BookingsService
from backend.src.utils.exceptions import BookingsAlreadyTakenError
import logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["Бронирования"])



@router.post("/")
async def add_booking(data: BookingsAddRequestSchema, db: DBDep, user_id: user_idDep):

    if data.date_from > data.date_to:
        logger.warning(f"Получены некорректные даты от пользователя с id {user_id}")
        raise HTTPException(status_code=422, detail="Дата начала не может быть позднее даты конца аренды")

    try:
        booking = await BookingsService(db).add_booking(data, user_id)
    except BookingsAlreadyTakenError:
        logger.debug(f"Попытка забронировать в даты недоступные для брони от пользователя с id {user_id}")
        raise HTTPException(status_code=409, detail="Нельзя забронировать на данный период, вещь уже забронирована в одну их этих дат")
    logger.debug(f"Добавлена бронь с id {booking.id}")
    return booking



