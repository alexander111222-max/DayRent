from src.repositories.mappers.mappers import UserDataMapper
from src.schemas.users import UserAddRequestSchema, UserAddSchema
from src.services.base import BaseService
from src.utils.exceptions import UserNotFoundException, ObjectNotFoundException


class UserService(BaseService):
    def __init__(self, db):
        super().__init__(db)


    async def add_one(self, data: UserAddSchema):

        data.lat = 1
        data.lon = 2

        added_user = await self._db.users.add_one(data)

        await self._db.commit()

        return added_user



    async def get_user(self, **filter_by):

        try:
            user = await self._db.users.get_one(**filter_by)
        except ObjectNotFoundException:
            raise UserNotFoundException
        return user




