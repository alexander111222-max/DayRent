from sqlalchemy import insert, select
from sqlalchemy.exc import NoResultFound

from src.models.users import UsersOrm
from src.repositories.base import BaseRepository
from src.repositories.mappers.mappers import UserDataMapper
from src.schemas.users import UserSchemaWithHashPass
from src.utils.exceptions import ObjectNotFoundException


class UserRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session,UsersOrm)

    mapper = UserDataMapper



    async def get_user_with_hash_password(self, **filter_by):

        query = select(self._model).filter_by(**filter_by)

        obj = await self._session.execute(query)

        try:
            model = obj.scalars().one()

        except NoResultFound:
            raise ObjectNotFoundException

        return UserSchemaWithHashPass.model_validate(model)



