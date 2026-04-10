from src.models.item_photos import ItemPhotosOrm
from src.models.items import ItemsOrm
from src.models.photos_url import PhotosUrlOrm
from src.models.users import UsersOrm
from src.repositories.mappers.base import DataMapper
from src.schemas.item_photos import ItemPhotosSchema
from src.schemas.items import ItemSchema
from src.schemas.photos_url import PhotosUrlSchema
from src.schemas.users import UserSchema


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