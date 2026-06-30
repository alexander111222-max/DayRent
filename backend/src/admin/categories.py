from sqladmin import ModelView

from backend.src.models.categories import CategoriesOrm


class CategoriesAdmin(ModelView, model=CategoriesOrm):
    pass
