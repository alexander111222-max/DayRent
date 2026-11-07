import asyncio
import logging
logger = logging.getLogger(__name__)


from backend.src.database import async_session_maker_null_pool
from backend.src.services.bookings import BookingsService
from backend.src.tasks.celery_app import celery_instance
from backend.src.utils.database import DBManager


async def change_active_to_completed_bookings():
    async with DBManager(async_session_maker_null_pool) as db:
        await BookingsService(db).change_active_to_completed()

async def change_confirm_to_active_bookings():
    async with DBManager(async_session_maker_null_pool) as db:
        await BookingsService(db).change_confirm_to_active()

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
        asyncio.run(change_confirm_to_active_bookings())
    except Exception:
        logger.exception("Failed to active bookings")
        raise