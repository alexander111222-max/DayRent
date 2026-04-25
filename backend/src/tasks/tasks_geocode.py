import asyncio

from backend.src.database import async_session_maker
from backend.src.schemas.search import DocumentUpdate
from backend.src.services.geocoder.yandex_geocoder import yandex_geo
from backend.src.services.items import ItemsService
from backend.src.services.search import update_doc
from backend.src.services.users import UserService
from backend.src.tasks.celery_app import celery_instance
from backend.src.utils.database import DBManager


@celery_instance.task
def geocode_user(user_id: int, address: str):

    async def _update():
        lat, lon = asyncio.run(yandex_geo.get_coordinates(address))
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
        doc_id = await update_doc(item_id, DocumentUpdate(location={"lat": lat, "lon": lon}))

    asyncio.run(_update())