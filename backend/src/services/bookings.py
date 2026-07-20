from backend.src.models.bookings import StatusEnum
from backend.src.schemas.bookings import BookingsAddRequestSchema, BookingsAddSchema, BookingPatchSchema
from backend.src.services.base import BaseService
from backend.src.utils.exceptions import BookingsAlreadyTakenError, MultipleObjectsFoundException, \
    ObjectNotFoundException, MultipleBookingsFoundException, BookingNotFoundException, \
    BookingCancelAccessDeniedException, ItemNotFoundException, BookingForbiddenException


class BookingsService(BaseService):
    def __init__(self, db):
        super().__init__(db)


    async def add_booking(self, data: BookingsAddRequestSchema, user_id: int):
        booking_data = BookingsAddSchema(**data.model_dump(), status=StatusEnum.PENDING, rent_id=user_id)
        item = await self._db.items.get_one_or_none(id=data.item_id)
        if not item:
            raise ItemNotFoundException
        if item.user_id == user_id:
            raise BookingForbiddenException

        try:

            booking = await self._db.bookings.add_booking(booking_data)

        except BookingsAlreadyTakenError:
            raise BookingsAlreadyTakenError
        await self._db.commit()
        return booking


    async def get_bookings_by_filter(self, *filters, **filter_by):
        bookings = await self._db.bookings.get_bookings_by_filter(*filters, **filter_by)
        return bookings

    async def edit_booking(self, data: BookingPatchSchema, booking_id: int, user_id: int):
        booking = await self._db.bookings.get_one_or_none(id=booking_id)
        if booking.rent_id != user_id and booking.owner_id != user_id:
            raise BookingCancelAccessDeniedException

        try:
            booking = await self._db.bookings.edit(data, id=booking_id)
            await self._db.commit()

        except ObjectNotFoundException:
            raise BookingNotFoundException
        except MultipleObjectsFoundException:
            raise MultipleBookingsFoundException
        return booking

