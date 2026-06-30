from sqladmin import ModelView

from backend.src.models.baskets import BasketsOrm


class BasketsAdmin(ModelView, model=BasketsOrm):
    pass
