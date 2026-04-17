from typing import List

from fastapi import APIRouter, HTTPException, UploadFile

from backend.src.services.geocoder.yandex_geocoder import yandex_geo
from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.schemas.items import ItemAddRequestSchema, ItemEditSchema
from backend.src.services.items import ItemsService
from backend.src.utils.exceptions import MultipleItemFoundException, ItemNotFoundException
from backend.src.tasks.tasks_geocode import geocode_item
from backend.src.tasks.tasks_photos import upload_photos

router = APIRouter(prefix="/items", tags=["items"])




@router.post("/")
async def add_item(data: ItemAddRequestSchema, db: DBDep, user_id: user_idDep):
    added_item = await ItemsService(db).add_item(data, user_id)

    geocode_item.delay(added_item.id, added_item.address)

    return {"added_item": added_item}


@router.patch("/")
async def edit_item(data: ItemEditSchema,item_id: int, db: DBDep):
    try:
        await ItemsService(db).edit(data, id=item_id)
        res = await yandex_geo.get_coordinate("бул. Мухаммед Бин Рашид, дом 1")
        return res
    except MultipleItemFoundException:
        raise HTTPException(status_code=409, detail="Таких предметов слишком много")
    except ItemNotFoundException:
        raise HTTPException(status_code=404, detail="Вещь не найдена")

@router.delete("/{item_id}")
async def delete_item(item_id: int, db: DBDep):
    deleted_item = await ItemsService(db).delete_item(id=item_id)
    return deleted_item

@router.post("/{item_id}/photos")
async def load_photos(files: List[UploadFile], item_id: int, ):
    files_data = []
    for file in files:
        content = await file.read()
        files_data.append({
            "filename": file.filename,
            "content": content
        })

    upload_photos.delay(files_data, item_id)