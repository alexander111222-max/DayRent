import asyncio

from celery.bin.control import status

from backend.src.database import async_session_maker_null_pool
from backend.src.models.bookings import StatusEnum
from datetime import date
import logging
logger = logging.getLogger(__name__)
from backend.src.schemas.bookings import BookingPatchSchema
from backend.src.services.bookings import BookingsService
from backend.src.tasks.celery_app import celery_instance
from backend.src.utils.database import DBManager


async def change_active_to_completed_bookings():
    async with DBManager(async_session_maker_null_pool) as db:
        await BookingsService(db).edit_booking(BookingPatchSchema(status=StatusEnum.COMPLETED), status=StatusEnum.ACTIVE, date_to=date.today())

async def change_pending_to_active_bookings():
    async with DBManager(async_session_maker_null_pool) as db:
        await BookingsService(db).edit_booking(BookingPatchSchema(status=StatusEnum.ACTIVE), status=StatusEnum.PENDING, date_to=date.today())

@celery_instance.task(name="change_to_completed")
def change_active_to_completed():
    try:
        asyncio.run(change_active_to_completed_bookings())
    except Exception:
        logger.exception("Failed to complete bookings")
        raise

@celery_instance.task(name="change_to_active")
def change_pending_to_active():
    try:
        asyncio.run(change_pending_to_active_bookings())
    except Exception:
        logger.exception("Failed to active bookings")
        raise