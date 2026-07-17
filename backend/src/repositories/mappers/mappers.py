from backend.src.models import RefreshTokensOrm
from backend.src.models.baskets import BasketsOrm
from backend.src.models.bookings import BookingsOrm
from backend.src.models.categories import CategoriesOrm
from backend.src.models.item_photos import ItemPhotosOrm
from backend.src.models.items import ItemsOrm
from backend.src.models.photos_url import PhotosUrlOrm
from backend.src.models.users import UsersOrm
from backend.src.repositories.mappers.base import DataMapper
from backend.src.schemas.baskets import BasketSchema
from backend.src.schemas.bookings import BookingSchema
from backend.src.schemas.categories import CategorySchema
from backend.src.schemas.item_photos import ItemPhotosSchema
from backend.src.schemas.items import ItemSchema
from backend.src.schemas.photos_url import PhotosUrlSchema
from backend.src.schemas.refresh_tokens import RefreshTokenSchema
from backend.src.schemas.users import UserSchema


class UserDataMapper(DataMapper[UsersOrm, UserSchema]):
    schema = UserSchema
    model = UsersOrm


class ItemDataMapper(DataMapper[ItemsOrm, ItemSchema]):
    schema = ItemSchema
    model = ItemsOrm


class ItemPhotosMapper(DataMapper[ItemPhotosOrm, ItemPhotosSchema]):
    schema = ItemPhotosSchema
    model = ItemPhotosOrm


class PhotosUrlMapper(DataMapper[PhotosUrlOrm, PhotosUrlSchema]):
    schema = PhotosUrlSchema
    model = PhotosUrlOrm


class CategoriesMapper(DataMapper[CategoriesOrm, CategorySchema]):
    schema = CategorySchema
    model = CategoriesOrm


class BasketsMapper(DataMapper[BasketsOrm, BasketSchema]):
    schema = BasketSchema
    model = BasketsOrm


class BookingsDataMapper(DataMapper[BookingsOrm, BookingSchema]):
    schema = BookingSchema
    model = BookingsOrm


class RefreshTokensDataMapper(DataMapper[RefreshTokensOrm, RefreshTokenSchema]):
    schema = RefreshTokenSchema
    model = RefreshTokensOrm
