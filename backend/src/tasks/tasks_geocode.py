import asyncio

from backend.src.database import async_session_maker
from backend.src.schemas.search import DocumentUpdate
from backend.src.services.geocoder.yandex_geocoder import yandex_geo
from backend.src.services.items import ItemsService
from backend.src.services.search import update_doc
from backend.src.services.users import UserService
from backend.src.tasks.celery_app import celery_instance
from backend.src.utils.database import DBManager
from backend.src.utils.exceptions import YandexGeocoderUnavailableException, YandexGeocoderAddressNotFoundException


@celery_instance.task(bind=True, max_retries=3, default_retry_delay=10)
def geocode_user(self, user_id: int, address: str):
    async def _update():
        lon, lat = await yandex_geo.get_coordinates(address)
        async with DBManager(async_session_maker) as db:
            service = UserService(db)
            await service.update_coordinates(user_id, lat, lon)
            await db.commit()

    try:
        asyncio.run(_update())
    except YandexGeocoderUnavailableException as exc:
        raise self.retry(exc=exc)
    except YandexGeocoderAddressNotFoundException:
        return


@celery_instance.task(bind=True, max_retries=3, default_retry_delay=10)
def geocode_item(self, item_id: int, address: str):
    async def _update():
        lon, lat = await yandex_geo.get_coordinates(address)
        async with DBManager(async_session_maker) as db:
            service = ItemsService(db)
            await service.update_coordinates(item_id, lat, lon)
            await db.commit()
        await update_doc(item_id, DocumentUpdate(location={"lat": lat, "lon": lon}))

    try:
        asyncio.run(_update())
    except YandexGeocoderUnavailableException as exc:
        raise self.retry(exc=exc)
    except YandexGeocoderAddressNotFoundException:
        return