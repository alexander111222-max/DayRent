from typing import List

from fastapi import APIRouter, HTTPException, UploadFile

from src.services.geocoder.yandex_geocoder import yandex_geo
from src.api.dependencies import DBDep, user_idDep
from src.schemas.items import ItemAddRequestSchema, ItemEditSchema
from src.services.items import ItemsService
from src.utils.exceptions import MultipleItemFoundException, ItemNotFoundException
from src.tasks.tasks import geocode_item, upload_photos

router = APIRouter(prefix="/items", tags=["items"])




@router.post("/add")
async def add_item(data: ItemAddRequestSchema, db: DBDep, user_id: user_idDep):
    added_item = await ItemsService(db).add_item(data, user_id)

    geocode_item.delay(added_item.id, added_item.address)

    return {"added_item": added_item}


@router.patch("/edit")
async def edit_item(data: ItemEditSchema,item_id: int, db: DBDep):
    try:
        await ItemsService(db).edit(data, id=item_id)
        res = await yandex_geo.get_coordinate("бул. Мухаммед Бин Рашид, дом 1")
        return res
    except MultipleItemFoundException:
        raise HTTPException(status_code=409, detail="Таких предметов слишком много")
    except ItemNotFoundException:
        raise HTTPException(status_code=404, detail="Вещь не найдена")


