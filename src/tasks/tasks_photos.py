import sys
from src.schemas.item_photos import ItemPhotosAddSchema
from src.schemas.photos_url import PhotosUrlAddSchema
from src.services.item_photos import ItemPhotosService
from src.services.photos_url import PhotosUrlService
from src.tasks.celery_app import celery_instance
import asyncio
from io import BytesIO
from asgiref.sync import async_to_sync

from src.utils.images import process_and_upload
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())




async def _process_single_photo(
    file_content: bytes,
    position: int,
    item_id: int,
) -> None:
    from src.utils.database import DBManager
    from src.database import get_async_session_maker
    from src.config import settings

    session_maker = get_async_session_maker(settings.DB_URL)

    async with DBManager(session_maker) as db:
        file_io = BytesIO(file_content)
        is_main = position == 1

        photo_record = await ItemPhotosService(db).add_one(
            ItemPhotosAddSchema(item_id=item_id, position=position, is_main=is_main)
        )

        # Параллельный ресайз + аплоад всех размеров
        url_size_pairs = await process_and_upload(file_io, item_id, photo_record.id)

        photos_url_service = PhotosUrlService(db)
        for url, size in url_size_pairs:
            await photos_url_service.add_one(
                PhotosUrlAddSchema(photo_id=photo_record.id, size=size, url=url)
            )

        await db.commit()


@celery_instance.task(bind=True, max_retries=3, default_retry_delay=5)
def upload_single_photo(self, file_content: bytes, position: int, item_id: int) -> None:
    try:
        async_to_sync(_process_single_photo)(file_content, position, item_id)
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_instance.task
def upload_photos(files_data: list[dict], item_id: int) -> None:
    for position, file_dict in enumerate(files_data, start=1):
        upload_single_photo.delay(file_dict["content"], position, item_id)
