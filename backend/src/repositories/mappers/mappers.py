from backend.src.models.categories import CategoriesOrm
from backend.src.models.item_photos import ItemPhotosOrm
from backend.src.models.items import ItemsOrm
from backend.src.models.photos_url import PhotosUrlOrm
from backend.src.models.users import UsersOrm
from backend.src.repositories.mappers.base import DataMapper
from backend.src.schemas.categories import CategorySchema
from backend.src.schemas.item_photos import ItemPhotosSchema
from backend.src.schemas.items import ItemSchema
from backend.src.schemas.photos_url import PhotosUrlSchema
from backend.src.schemas.users import UserSchema


class UserDataMapper(DataMapper):
    schema = UserSchema
    model = UsersOrm


class ItemDataMapper(DataMapper):
    schema = ItemSchema
    model = ItemsOrm


class ItemPhotosMapper(DataMapper):
    schema = ItemPhotosSchema
    model = ItemPhotosOrm

class PhotosUrlMapper(DataMapper):
    schema = PhotosUrlSchema
    model = PhotosUrlOrm


class CategoriesMapper(DataMapper):
    schema = CategorySchema
    model = CategoriesOrm