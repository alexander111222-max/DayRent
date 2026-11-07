from datetime import date

from backend.src.models.bookings import StatusEnum, BookingsOrm
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

    async def edit_booking(self, data: BookingPatchSchema, *filters, **filter_by):

        try:
            booking = await self._db.bookings.edit(data, *filters, **filter_by)
            await self._db.commit()

        except ObjectNotFoundException:
            raise BookingNotFoundException
        except MultipleObjectsFoundException:
            raise MultipleBookingsFoundException
        return booking


    async def cancel(self, data: BookingPatchSchema, booking_id: int, user_id: int):

        booking = await self._db.bookings.get_one_or_none(id=booking_id)
        if booking is None:
            raise BookingNotFoundException

        if booking.rent_id != user_id and booking.owner_id != user_id:
            raise BookingCancelAccessDeniedException
        new_booking = await self.edit_booking(data, id=booking_id)

        return new_booking




    async def confirm(self, data: BookingPatchSchema, booking_id: int, user_id: int):

        booking = await self._db.bookings.get_one_or_none(id=booking_id)
        if booking is None:
            raise BookingNotFoundException
        if booking.owner_id != user_id:
            raise BookingCancelAccessDeniedException
        await self.edit_booking(data, id=booking_id)

        return True

    async def change_active_to_completed(self):
        bookings = await self._db.edit_bulk(BookingPatchSchema(status=StatusEnum.COMPLETED), BookingsOrm.date_to < date.today(), status=StatusEnum.ACTIVE)
        return bookings

    async def change_confirm_to_active(self):
        bookings = await self._db.edit_bulk(BookingPatchSchema(status=StatusEnum.ACTIVE), BookingsOrm.date_from >= date.today(), status=StatusEnum.CONFIRMED)
        return bookings





