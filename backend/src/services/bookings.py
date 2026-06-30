from backend.src.models.bookings import StatusEnum
from backend.src.schemas.bookings import BookingsAddRequestSchema, BookingsAddSchema, BookingPatchSchema
from backend.src.services.base import BaseService
from backend.src.utils.exceptions import BookingsAlreadyTakenError, MultipleObjectsFoundException, \
    ObjectNotFoundException, MultipleBookingsFoundException, BookingNotFoundException


class BookingsService(BaseService):
    def __init__(self, db):
        super().__init__(db)


    async def add_booking(self, data: BookingsAddRequestSchema, user_id: int):
        booking_data = BookingsAddSchema(**data.model_dump(), status=StatusEnum.ACTIVE, rent_id=user_id)
        try:

            booking = await self._db.bookings.add_booking(booking_data)

        except BookingsAlreadyTakenError:
            raise BookingsAlreadyTakenError
        await self._db.commit()
        return booking


    async def get_bookings_by_filter(self, *filters, **filter_by):
        bookings = await self._db.bookings.get_bookings_by_filter(*filters, **filter_by)
        return bookings

    async def edit_booking(self, data: BookingPatchSchema, *filters, **filter_by):
        try:
            booking = await self._db.bookings.edit(data, *filters, **filter_by)

        except ObjectNotFoundException:
            raise BookingNotFoundException
        except MultipleObjectsFoundException:
            raise MultipleBookingsFoundException
        return booking

