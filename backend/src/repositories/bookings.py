from sqlalchemy import select, or_, and_

from backend.src.models.bookings import BookingsOrm, StatusEnum
from backend.src.models.items import ItemsOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import BookingsDataMapper
from backend.src.schemas.bookings import BookingsAddSchema, BookingSchema
from backend.src.utils.exceptions import BookingsAlreadyTakenError


class BookingsRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, BookingsOrm)

    mapper = BookingsDataMapper

    async def get_bookings_by_filter(self, *filters, **filter_by) -> list[BookingSchema]:

        query = select(self._model).filter(*filters).filter_by(**filter_by)

        result = await self._session.execute(query)
        models = result.scalars().all()

        if not models:
            return []

        return [self.mapper.map_to_domain_entity(model) for model in models]

    async def add_booking(self, data: BookingsAddSchema):

        query = (
            select(ItemsOrm)
            .where(ItemsOrm.id == data.item_id)
            .with_for_update()
        )

        await self._session.execute(query)

        bookings = await self.get_bookings_by_filter(
            self._model.item_id == data.item_id,
            self._model.date_from < data.date_to,
            self._model.date_to > data.date_from,
            self._model.status == StatusEnum.ACTIVE
        )

        if bookings:
            raise BookingsAlreadyTakenError

        model = await self.add_one(data)

        return self.mapper.map_to_domain_entity(model)



