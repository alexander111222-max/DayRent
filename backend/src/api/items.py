from typing import List, Annotated
from fastapi import APIRouter, HTTPException, UploadFile, Path, Query
from sqlalchemy import or_

from backend.src.connectors.s3 import s3_client
from backend.src.models import UsersOrm, BookingsOrm
from backend.src.models.bookings import StatusEnum
from backend.src.schemas.bookings import BookingWithRenter
from backend.src.schemas.item_photos import ItemPhotosSchemaWithUrl
from backend.src.schemas.search import DocumentIn, DocumentUpdate
from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.schemas.items import ItemAddRequestSchema, ItemEditSchema, ItemSchemaWithPhotos
from backend.src.schemas.users import RenterSchema
from backend.src.services.ItemPhotosS3 import ItemPhotosS3Manager, SizePhotos
from backend.src.services.bookings import BookingsService
from backend.src.services.item_photos import ItemPhotosService
from backend.src.services.items import ItemsService
from backend.src.services.search import create_doc, update_doc
from backend.src.services.users import UserService
from backend.src.utils.exceptions import MultipleItemFoundException, ItemNotFoundException, CategoryNotFoundException, \
    ForbiddenException
from backend.src.tasks.tasks_geocode import geocode_item

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
async def edit_item(data: ItemEditSchema, item_id: Annotated[int, Query(ge=1, le=2147483647)], db: DBDep, user_id: user_idDep):

    try:
        if data.address:
            geocode_item.delay(item_id, data.address)

        edited_item = await ItemsService(db).edit(data, user_id, item_id, id=item_id)
        await update_doc(edited_item.id, DocumentUpdate(**data.model_dump(exclude_unset=True)))

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
async def delete_item(item_id: Annotated[int, Path(ge=1, le=2147483647)], db: DBDep, user_id: user_idDep):
    try:
        deleted_item = await ItemsService(db).delete_item(user_id, item_id)
    except ItemNotFoundException:
        logger.warning(f"Вещь с id {item_id} для изменения не найдена")
        raise HTTPException(status_code=404, detail="Вещь не найдена")
    except ForbiddenException:
        logger.warning(f"Попытка изменить вещь с id {item_id} не принадлежащую пользователю с id {user_id}")
        raise HTTPException(status_code=403, detail="Доступ на редактирование запрещен, это не ваша вещь")

    return deleted_item



@router.get("/{item_id}", response_model=ItemSchemaWithPhotos)
async def get_item(item_id: int, db: DBDep):
    item = await ItemsService(db).get_item_one_or_none_by_id(item_id)

    item_photos = await ItemPhotosService(db).get_filter_by(item_id=item_id)
    photos_ids = [photo.id for photo in item_photos]
    item_photos_s3_manager = ItemPhotosS3Manager(s3_client)

    list_photos = await item_photos_s3_manager.get_photos(item_id, photos_ids, SizePhotos.MEDIUM) # список [(photo_id, url), ....)
    new_dict = {}                                                                                         # словарь из photo_id: url
    for photo_id, url in list_photos:
        new_dict[photo_id] = url

    new_photo_items = [ItemPhotosSchemaWithUrl(**photo_item.model_dump()) for photo_item in item_photos]  # тут теперь ItemPhotosSchemaWithUrl полная схема, фото с урл

    for i in range(len(new_photo_items)):
        el = new_photo_items[i]
        new_photo_items[i].url = new_dict[el.id]

    return ItemSchemaWithPhotos(**item.model_dump(), photos_urls=new_photo_items)




@router.get("/{item_id}/bookings")
async def get_bookings_item(item_id: int, db: DBDep, user_id: user_idDep) -> list[BookingWithRenter]:
    item = await ItemsService(db).get_item_one_or_none_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Такой вещи не найдено.")
    if item.user_id != user_id:
        raise HTTPException(status_code=403, detail="Доступ к просмотру бронированйи не своей вещи запрещен.")

    bookings = await BookingsService(db).get_bookings_by_filter(or_(BookingsOrm.status == StatusEnum.ACTIVE, BookingsOrm.status == StatusEnum.CONFIRMED), item_id=item_id)
    renter_ids = [booking.rent_id for booking in bookings]
    renters = await UserService(db).get_users_filter_by(UsersOrm.id.in_(renter_ids))
    renters_dict = {}
    for renter in renters:
        renters_dict[renter.id] = RenterSchema(**renter.model_dump())

    res = [BookingWithRenter(**booking.model_dump(), renter=renters_dict[booking.rent_id]) for booking in bookings]

    return res




