from sqladmin import ModelView

from backend.src.models.items import ItemsOrm


class ItemsAdmin(ModelView, model=ItemsOrm):
    pass
