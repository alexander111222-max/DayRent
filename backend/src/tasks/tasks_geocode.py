import asyncio

from backend.src.database import async_session_maker
from backend.src.services.geocoder.yandex_geocoder import yandex_geo
from backend.src.services.items import ItemsService
from backend.src.services.users import UserService
from backend.src.tasks.celery_app import celery_instance
from backend.src.utils.database import DBManager


@celery_instance.task
def geocode_user(user_id: int, address: str):

    lat, lon = asyncio.run(yandex_geo.get_coordinates(address))

    async def _update():
        async with DBManager(async_session_maker) as db:
            service = UserService(db)
            await service.update_coordinates(user_id, lat, lon)
            await db.commit()


    asyncio.run(_update())

@celery_instance.task
def geocode_item(item_id: int, address: str):

    async def _update():
        lat, lon = await yandex_geo.get_coordinates(address)
        async with DBManager(async_session_maker) as db:
            service = ItemsService(db)
            await service.update_coordinates(item_id, lat, lon)
            await db.commit()

    asyncio.run(_update())