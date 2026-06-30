from sqladmin import ModelView

from backend.src.models.users import UsersOrm


class UsersAdmin(ModelView, model=UsersOrm):
    pass

