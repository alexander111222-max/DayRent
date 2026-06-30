from celery.bin.control import status
from dns.e164 import query
from fastapi import APIRouter, HTTPException

from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.models.bookings import StatusEnum
from backend.src.schemas.bookings import BookingsAddRequestSchema, BookingPatchSchema
from backend.src.services.bookings import BookingsService
from backend.src.services.users import UserService
from backend.src.utils.exceptions import BookingsAlreadyTakenError, BookingNotFoundException, \
    MultipleBookingsFoundException
from faststream.rabbit.fastapi import RabbitRouter
import logging
logger = logging.getLogger(__name__)
router = RabbitRouter(prefix="/bookings", tags=["Бронирования"])



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
    user_owner = await UserService(db).get_user(id=data.owner_id)
    user_rent = await UserService(db).get_user(id=user_id)
    booking_data = {
        "event": "booking_created",
        "booking": {
            "id": booking.id,
            "date_from": str(booking.date_from),
            "date_to": str(booking.date_to),
        },
        "owner": {
            "email": user_owner.email,
        },
        "renter": {
            "email": user_rent.email,
        },
    }
    await router.broker.publish(message=booking_data, queue="bookings", content_type="application/json")
    return booking





@router.post("/cancel")
async def cancel_booking(booking_id: int, db: DBDep):
    try:
        new_booking = await BookingsService(db).edit_booking(
            BookingPatchSchema(status=StatusEnum.CANCELLED),
            id=booking_id,
        )
    except BookingNotFoundException:
        raise HTTPException(
            status_code=404,
            detail="Бронирование не найдено",
        )
    except MultipleBookingsFoundException:
        raise HTTPException(
            status_code=500,
            detail="Найдено несколько бронирований с одинаковым идентификатором",
        )

    return new_booking


