import time
from datetime import timedelta, datetime, timezone

from argon2 import hash_password
from celery.worker.consumer.mingle import exception
from wtforms.validators import email

from backend.src.config import settings
from backend.src.repositories.users import UserRepository
from backend.src.schemas.users import UserAddSchema, CoordinateUser, UserPatchSchema, UserAddRequestSchema, \
    UserLoginSchema
from backend.src.services.auth import AuthService
from backend.src.services.base import BaseService
from backend.src.utils.exceptions import UserNotFoundException, ObjectNotFoundException, UserLoginException, \
    WrongPasswordException, UserAlreadyExistsException, ObjectAlreadyExistsException


class UserService(BaseService):
    def __init__(self, db):
        super().__init__(db)


    async def get_user_with_hash_password(self, **filter_by):
        try:
            user = self._db.users.get_user_with_hash_password(**filter_by)
        except ObjectNotFoundException:
            raise UserLoginException

        return user

    async def add_one(self, data: UserAddSchema):

        added_user = await self._db.users.add_one(data)
        await self._db.commit()

        return added_user


    async def register(self, data: UserAddRequestSchema):
        if data.password != data.password_confirm:
            raise WrongPasswordException

        existing = await self._db.users.get_one_or_none(email=data.email)
        if existing:
            raise UserAlreadyExistsException

        hashed_password = AuthService().get_password_hash(data.password)

        user = await self.add_one(
            UserAddSchema(**data.model_dump(exclude={"password", "password_confirm"}), hash_password=hashed_password)
        )

        return user


    async def login(self, data: UserLoginSchema):
        try:
            user = await self._db.users.get_user_with_hash_password(email=data.email)
        except ObjectNotFoundException:
            raise UserNotFoundException

        if not AuthService().verify_password(data.password, user.hash_password):
            raise WrongPasswordException

        token = AuthService().create_token({"user_id": user.id, "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.TTL)})
        return token

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
        await self._db.commit()



    async def delete_user(self, *filters, **filter_by):
        deleted_user = await self._db.users.delete(*filters, **filter_by)
        await self._db.commit()
        return deleted_user


    async def modify_user(self, data: UserPatchSchema, user_id: int, *filters, **filter_by):
        from backend.src.tasks.tasks_geocode import geocode_user
        if data.address:
            geocode_user.delay(user_id, data.address)
        modified_user = await self._db.users.edit(data, *filters, **filter_by)
        await self._db.commit()
        return modified_user
