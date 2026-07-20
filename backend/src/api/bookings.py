
from fastapi import APIRouter, HTTPException

from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.connectors.rebbit_mq import broker

from backend.src.models.bookings import StatusEnum
from backend.src.schemas.bookings import BookingsAddRequestSchema, BookingPatchSchema
from backend.src.services.bookings import BookingsService
from backend.src.services.users import UserService
from backend.src.utils.exceptions import BookingsAlreadyTakenError, BookingNotFoundException, \
    MultipleBookingsFoundException, BookingCancelAccessDeniedException, ItemNotFoundException, BookingForbiddenException
from faststream.rabbit import RabbitExchange, ExchangeType
import logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["bookings"])


booking_exchange = RabbitExchange("booking_exchange", type=ExchangeType.TOPIC)


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
    except ItemNotFoundException as e:
        raise HTTPException(status_code=404, detail=f"{e}")
    except BookingForbiddenException as e:
        raise HTTPException(status_code=403, detail=f"{e}")
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
    await broker.publish(message=booking_data,
                         exchange=booking_exchange,
                         routing_key="booking.create",
                         content_type="application/json")
    return booking


@router.post("/cancel")
async def cancel_booking(booking_id: int, db: DBDep, user_id: user_idDep):
    try:
        booking = await BookingsService(db).get_bookings_by_filter(id=booking_id)
        if booking[0].status == StatusEnum.CANCELLED:
            raise HTTPException(status_code=409, detail="Бронь уже отменена")
        new_booking = await BookingsService(db).edit_booking(
            BookingPatchSchema(status=StatusEnum.CANCELLED),
            booking_id=booking_id,
            user_id=user_id
        )

        user_owner = await UserService(db).get_user(id=new_booking.owner_id)
        user_rent = await UserService(db).get_user(id=new_booking.rent_id)
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
    except BookingCancelAccessDeniedException as e:
        raise HTTPException(status_code=403, detail=f"{e}")

    if new_booking.owner_id == user_id:
        cancelled_user = "owner"
    else:
        cancelled_user = "renter"
    booking_data = {
        "event": "booking_cancelled",
        "booking": {
            "id": new_booking.id,
            "date_from": str(new_booking.date_from),
            "date_to": str(new_booking.date_to),
        },
        "owner": {
            "email": user_owner.email,
        },
        "renter": {
            "email": user_rent.email,
        },
        "cancelled_user": cancelled_user
    }
    await broker.publish(message=booking_data,
                         exchange=booking_exchange,
                         routing_key="booking.cancel",
                         content_type="application/json")

    return new_booking


