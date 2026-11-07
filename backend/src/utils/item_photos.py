from backend.src.api.dependencies import DBDep
from backend.src.connectors.s3 import s3_client
from backend.src.schemas.items import ItemSchema, ItemSchemaWithMainPhotoUrl
from backend.src.services.ItemPhotosS3 import ItemPhotosS3Manager, SizePhotos
from backend.src.services.item_photos import ItemPhotosService


async def get_item_with_main_photo(items: list[ItemSchema], db: DBDep,  order_ids: list[int] = None):  # order_ids для сеарч
    s3_item_photos_manager = ItemPhotosS3Manager(s3_client)
    if order_ids is None:
        order_ids = [item.id for item in items]
    dict_items = {}
    for item in items:
        dict_items[item.id] = item

    success_list_items = [dict_items[id_item] for id_item in order_ids if id_item in dict_items]

    main_photos: dict = await ItemPhotosService(db).get_main_photos(order_ids)
    item_id_and_url = {}
    for item_id, photo_id in main_photos.items():
        url = await s3_item_photos_manager.get_one_photo(item_id, photo_id, SizePhotos.SMALL)
        item_id_and_url[item_id] = url

    new_items = []
    for item in success_list_items:
        new_item = ItemSchemaWithMainPhotoUrl(**item.model_dump(), main_photo_url=item_id_and_url.get(item.id))
        new_items.append(new_item)

    return new_items