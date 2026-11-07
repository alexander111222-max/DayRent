import sys

import celery


from backend.src.database import async_session_maker_null_pool
from backend.src.services.item_photos import ItemPhotosService
from backend.src.tasks.celery_app import celery_instance
import asyncio
from io import BytesIO

import logging

logger = logging.getLogger("CeleryTaskPhoto")

from backend.src.utils.database import DBManager
from backend.src.utils.images import process_and_upload
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def _delete_item_photo(photo_id: int):
    async with DBManager(async_session_maker_null_pool) as db:
        await ItemPhotosService(db).delete(id=photo_id)
        await db.commit()


class UploadSinglePhoto(celery.Task):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        photo_id = args[1]
        try:
            asyncio.run(_delete_item_photo(photo_id))
        except Exception:
            logger.exception(f"Не удалось удалить запись о фото с id {photo_id} из бд")



async def _process_single_photo(
    file_content: bytes,
    photo_id: int,
    item_id: int,
    ) -> None:

    file_io = BytesIO(file_content)

    # Параллельный ресайз + аплоад всех размеров
    url_size_pairs = await process_and_upload(file_io, item_id, photo_id)



@celery_instance.task(bind=True, base=UploadSinglePhoto, max_retries=3)
def upload_single_photo(self, file_content, photo_id: int, item_id: int):
    try:
        asyncio.run(
            _process_single_photo(file_content, photo_id, item_id)
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=5)



@celery_instance.task
def upload_photos(files_data: list[dict], item_id: int, ids_photos: list[int]) -> None:
    for photo_id, file_dict in zip(ids_photos, files_data):
        upload_single_photo.delay(file_dict["content"], photo_id, item_id)


