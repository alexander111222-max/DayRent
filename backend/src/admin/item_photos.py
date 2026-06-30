from sqladmin import ModelView

from backend.src.models.item_photos import ItemPhotosOrm


class ItemPhotosAdmin(ModelView, model=ItemPhotosOrm):
    pass

