from typing import List
from fastapi import APIRouter, HTTPException, UploadFile

from backend.src.schemas.search import DocumentIn
from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.schemas.items import ItemAddRequestSchema, ItemEditSchema
from backend.src.services.items import ItemsService
from backend.src.services.search import create_doc
from backend.src.utils.exceptions import MultipleItemFoundException, ItemNotFoundException, CategoryNotFoundException, \
    ForbiddenException
from backend.src.tasks.tasks_geocode import geocode_item
from backend.src.tasks.tasks_photos import upload_photos
import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/items", tags=["items"])




@router.post("/")
async def add_item(data: ItemAddRequestSchema, db: DBDep, user_id: user_idDep):
    try:
        added_item = await ItemsService(db).add_item(data, user_id)
    except CategoryNotFoundException:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    doc_id = await create_doc(added_item.id,
                              doc=DocumentIn(
                                  **data.model_dump(),
                                  created_at=added_item.created_at
                              ))
    geocode_item.delay(added_item.id, added_item.address)
    logger.debug(f"Добавлена в бд и в ElasticSearch новая вещь от user_id: {user_id} item_id: {added_item.id}")
    return {"added_item": added_item}


@router.patch("/")
async def edit_item(data: ItemEditSchema, item_id: int, db: DBDep, user_id: user_idDep):

    try:
        if data.address:
            geocode_item.delay(item_id, data.address)

        edited_item = await ItemsService(db).edit(data, user_id, item_id, id=item_id)
        return edited_item
    except MultipleItemFoundException:
        logger.error(f"Более одной вещи с id {item_id}")
        raise HTTPException(status_code=409, detail="Таких предметов слишком много")
    except ItemNotFoundException:
        logger.warning(f"Вещь с id {item_id} для изменения не найдена")
        raise HTTPException(status_code=404, detail="Вещь не найдена")
    except CategoryNotFoundException:
        logger.warning(f"Вещь с id {item_id} для изменения не найдена")
        raise HTTPException(status_code=400, detail="Такой категории вещей не существует")
    except ForbiddenException:
        logger.warning(f"Попытка изменить вещь с id {item_id} не принадлежащую пользователю с id {user_id}")
        raise HTTPException(status_code=403, detail="Доступ на редактирование запрещен, это не ваша вещь")




@router.delete("/{item_id}")
async def delete_item(item_id: int, db: DBDep, user_id: user_idDep):
    try:
        deleted_item = await ItemsService(db).delete_item(user_id, item_id)
    except ItemNotFoundException:
        logger.warning(f"Вещь с id {item_id} для изменения не найдена")
        raise HTTPException(status_code=404, detail="Вещь не найдена")
    except ForbiddenException:
        logger.warning(f"Попытка изменить вещь с id {item_id} не принадлежащую пользователю с id {user_id}")
        raise HTTPException(status_code=403, detail="Доступ на редактирование запрещен, это не ваша вещь")

    return deleted_item




@router.post("/{item_id}/photos")
async def load_photos(files: List[UploadFile], item_id: int):

    files_data = []
    for file in files:
        content = await file.read()
        files_data.append({
            "filename": file.filename,
            "content": content
        })

    upload_photos.delay(files_data, item_id)
    logger.info(f"Загрузились фотографии для вещи с id {item_id}")
    return {"status": "ok"}