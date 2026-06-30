from sqladmin import ModelView

from backend.src.models.bookings import BookingsOrm


class BookingsAdmin(ModelView, model=BookingsOrm):
    pass
