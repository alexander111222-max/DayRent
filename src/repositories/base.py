from typing import Type

from pydantic import BaseModel
from sqlalchemy import insert, select, update, func
from sqlalchemy.exc import NoResultFound

from src.repositories.mappers.base import DataMapper
from src.utils.exceptions import ObjectNotFoundException, MultipleObjectsFoundException


def check_single_obj(function):
    async def wrapper(self, data, *filters, **filter_by):
        async with self._session.begin_nested():
            query = select(func.count()).select_from(self._model).filter_by(**filter_by)
            result = await self._session.execute(query)
            count = result.scalar()

            if count == 0:
                raise ObjectNotFoundException
            if count > 1:
                raise MultipleObjectsFoundException

            result = await function(self, data, *filters, **filter_by)
            return result

    return wrapper

class BaseRepository:

    mapper: Type[DataMapper]

    def __init__(self, session, model):
        self._session = session
        self._model = model


    async def add_one(self, data: BaseModel):

        stmt = insert(self._model).values(**data.model_dump()).returning(self._model)

        row = await self._session.execute(stmt)
        model = row.scalar_one_or_none()
        result = self.mapper.map_to_domain_entity(model)

        return result

    async def get_filter_by(self, *filters, **filter_by):
        query = select(self._model).filter(*filters).filter_by(**filter_by)

        objs = await self._session.execute(query)

        return [self.mapper.map_to_domain_entity(model) for model in (objs.scalars().all())]


    async def get_all(self):

        result = await self.get_filter_by()

        return result


    async def get_one(self, **filter_by):

        query = select(self._model).filter_by(**filter_by)
        obj = await self._session.execute(query)

        try:
            model = obj.scalar_one()

        except NoResultFound:
            raise ObjectNotFoundException

        return self.mapper.map_to_domain_entity(model)

    async def get_one_or_none(self, **filter_by):

        query = select(self._model).filter_by(**filter_by)
        obj = await self._session.execute(query)

        model = obj.scalar().one_or_none()

        if model is None:
            return None

        return self.mapper.map_to_domain_entity(model)

    @check_single_obj
    async def edit(self, data: BaseModel, *filters, **filter_by):

        update_stmt = (update(self._model)
                       .filter(*filters)
                       .filter_by(**filter_by)
                       .values(**data.model_dump(exclude_unset=True)))

        await self._session.execute(update_stmt)









