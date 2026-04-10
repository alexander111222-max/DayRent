import sys
from io import BytesIO


from fastapi import  File

from src.database import async_session_maker
from src.schemas.item_photos import ItemPhotosAddSchema
from src.schemas.photos_url import PhotosUrlAddSchema
from src.services.geocoder.yandex_geocoder import yandex_geo
from src.services.item_photos import ItemPhotosService
from src.services.photos_url import PhotosUrlService
from src.tasks.celery_app import celery_instance

from src.services.users import UserService
from src.services.items import ItemsService
import asyncio
from asgiref.sync import async_to_sync
from src.utils.database import DBManager
from src.utils.images import process_and_upload
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

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

async def _add_item_photos_and_photos_url(position: int, file: File, item_id: int, db):
    is_main = True

    service1 = ItemPhotosService(db)
    if position != 1:
        is_main = False
    added_item_photos = await service1.add_one(ItemPhotosAddSchema(
        item_id=item_id,
        position=position,
        is_main=is_main
    ))
    gen = process_and_upload(file, item_id, added_item_photos.id)
    service2 = PhotosUrlService(db)
    async for url, size in gen:
        added_photo_url = await service2.add_one(PhotosUrlAddSchema(
            photo_id=added_item_photos.id,
            size=size,
            url=url
        ))


@celery_instance.task
def upload_photos(files_data: list, item_id: int):
    from src.utils.database import DBManager
    from src.database import get_async_session_maker
    from src.config import settings

    async def _internal_process():
        session_maker = get_async_session_maker(settings.DB_URL)
        engine_to_dispose = session_maker.kw['bind']

        try:
            async with DBManager(session_maker) as db:
                for i, file_dict in enumerate(files_data, start=1):
                    file_io = BytesIO(file_dict["content"])
                    await _add_item_photos_and_photos_url(i, file_io, item_id, db)

                await db.commit()
        finally:
            await engine_to_dispose.dispose()

    try:
        async_to_sync(_internal_process)()
    except Exception as e:
        print(f"CRITICAL ERROR IN TASK: {e}")
        raise e
