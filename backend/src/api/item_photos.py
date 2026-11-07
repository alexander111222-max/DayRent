from typing import List, Annotated

from fastapi import APIRouter, Path, UploadFile, HTTPException

from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.models import ItemPhotosOrm
from backend.src.schemas.item_photos import ItemPhotosAddSchema
from backend.src.services.item_photos import ItemPhotosService
from backend.src.services.items import ItemsService
from backend.src.tasks.tasks_photos import upload_photos
router = APIRouter(prefix="/photos")

import logging
logger = logging.getLogger(__name__)

@router.post("/{item_id}")
async def load_photos(files: List[UploadFile], item_id: Annotated[int, Path(ge=1, le=2147483647)], db: DBDep, user_id: user_idDep):
    item = await ItemsService(db).get_item_one_or_none_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Вещь не найдена")
    if item.user_id != user_id:
        raise HTTPException(status_code=403, detail="Вы не можете загрузить фото для не своей вещи")
    files_data = []
    for file in files:

        content = await file.read()
        files_data.append({
            "filename": file.filename,
            "content": content
        })
    item_photos = await ItemPhotosService(db).get_filter_by(item_id=item.id)


    if not item_photos:
        position = 1
    else:
        positions = [item_photo.position for item_photo in item_photos]
        position = max(positions) + 1
    ids_photos = []
    if position == 1:
        is_main = True
    else:
        is_main = False
    if is_main is True:
        item_photo = await ItemPhotosService(db).add_one(ItemPhotosAddSchema(item_id=item_id, position=position, is_main=is_main))
        is_main = False
        position += 1
        item_photos_added_bulk = await ItemPhotosService(db).add_bulk(
            [ItemPhotosAddSchema(item_id=item_id, position=pos, is_main=is_main) for pos in range(position, position + len(files) - 1)]
        )
        ids_photos.append(item_photo.id)
        ids_photos.extend([item_ph.id for item_ph in item_photos_added_bulk])
    else:
        item_photos_added_bulk = await ItemPhotosService(db).add_bulk(
            [ItemPhotosAddSchema(item_id=item_id, position=pos, is_main=is_main) for pos in
             range(position, position + len(files))]
        )
        ids_photos.extend([item_ph.id for item_ph in item_photos_added_bulk])

    upload_photos.delay(files_data, item_id, ids_photos)
    logger.info(f"Загрузились фотографии для вещи с id {item_id}")
    return {"status": "ok"}