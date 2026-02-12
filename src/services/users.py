from src.repositories.mappers.mappers import UserDataMapper
from src.schemas.users import UserAddRequestSchema, UserAddSchema
from src.services.base import BaseService


class UserService(BaseService):
    def __init__(self, db):
        super().__init__(db)


    async def add_one(self, data: UserAddRequestSchema):


        _user = data.model_dump()
        _user["lat"] = 1
        _user["lon"] = 2
        new_user = UserAddSchema.model_validate(_user)

        added_user = await self._db.users.add_one(new_user)

        await self._db.commit()

        return added_user


