from backend.src.repositories.mappers.mappers import UserDataMapper
from backend.src.schemas.users import UserAddRequestSchema, UserAddSchema, CoordinateUser
from backend.src.services.base import BaseService
from backend.src.utils.exceptions import UserNotFoundException, ObjectNotFoundException


class UserService(BaseService):
    def __init__(self, db):
        super().__init__(db)


    async def add_one(self, data: UserAddSchema):



        added_user = await self._db.users.add_one(data)

        await self._db.commit()

        return added_user



    async def get_user(self, **filter_by):

        try:
            user = await self._db.users.get_one(**filter_by)
        except ObjectNotFoundException:
            raise UserNotFoundException
        return user

    async def update_coordinates(self, user_id: int, lat: float, lon: float):
        coor_user = CoordinateUser(
            lat=lat,
            lon=lon
        )
        await self._db.users.edit(coor_user, id=user_id)



    async def delete_user(self, *filters, **filter_by):
        deleted_user = await self._db.users.delete(*filters, **filter_by)
        await self._db.commit()
        return deleted_user