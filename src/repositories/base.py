from typing import Type

from pydantic import BaseModel
from sqlalchemy import insert, select
from sqlalchemy.exc import NoResultFound

from src.repositories.mappers.base import DataMapper
from src.utils.exceptions import ObjectNotFoundException


class BaseRepository:

    mapper: Type[DataMapper]

    def __init__(self, session, model):
        self._session = session
        self._model = model


    async def add_one(self, data: BaseModel):

        stmt = insert(self._model).values(**data.model_dump()).returning(self._model)

        row = await self._session.execute(stmt)
        model = row.scalar_one_or_none()
        user = self.mapper.map_to_domain_entity(model)

        return user

    async def get_filter_by(self, *filters, **filter_by):
        query = select(self._model).filter(*filters).filter_by(**filter_by)

        objs = await self._session.execute(query)

        return [self.mapper.map_to_domain_entity(model) for model in (objs.scalars().all())]


    async def get_all(self,  *filters, **filter_by):

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





