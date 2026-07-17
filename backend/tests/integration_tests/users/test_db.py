from backend.src.database import async_session_maker
from backend.src.services.users import UserService
from backend.src.utils.database import DBManager
from backend.src.schemas.users import UserAddSchema

async def test_create_user():

    async with DBManager(async_session_maker) as db:

        new_user = UserAddSchema(
            username="string",
            surname="string",
            age=20,
            phone="string",
            email="shurak26@bk.ru",
            city="string",
            address="string",
            hash_password="string123"
        )

        user = await UserService(db).add_one(new_user)
        assert user



