from sqladmin import Admin

from backend.src.admin.baskets import BasketsAdmin
from backend.src.admin.bookings import BookingsAdmin
from backend.src.admin.categories import CategoriesAdmin
from backend.src.admin.item_photos import ItemPhotosAdmin
from backend.src.admin.items import ItemsAdmin
from backend.src.admin.photos_url import PhotosUrlAdmin
from backend.src.admin.users import UsersAdmin
from backend.src.database import engine


def setup_admin(app):
    admin = Admin(app, engine)
    admin.add_view(UsersAdmin)
    admin.add_view(BookingsAdmin)
    admin.add_view(ItemsAdmin)
    admin.add_view(BasketsAdmin)
    admin.add_view(CategoriesAdmin)
    admin.add_view(ItemPhotosAdmin)
    admin.add_view(PhotosUrlAdmin)