from datetime import timedelta, timezone, datetime

import jwt
from pwdlib import PasswordHash

from src.config import settings
from src.schemas.users import UserAddRequestSchema, UserAddSchema, UserSchema, UserLoginSchema
from src.services.base import BaseService
from src.services.users import UserService
from src.utils.exceptions import ObjectNotFoundException, UserLoginException


class AuthService(BaseService):

    pwd_context = PasswordHash.recommended()

    def create_token(self, data: dict):

        to_encode = data.copy()

        expire = datetime.now(timezone.utc) + timedelta(settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

        return encoded_jwt

    def decode_token(self, token):

        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        user_id = payload["user_id"]
        return user_id

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)


    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)



    async def register_user(self, data: UserAddRequestSchema):
        hashed_password = self.get_password_hash(data.password)
        payload = data.model_dump(exclude={"password"})

        new_user = UserAddSchema(**payload, hash_password=hashed_password)

        added_user: UserSchema = await UserService(self._db).add_one(new_user)

        return added_user

    async def login_user(self, data: UserLoginSchema):

        try:
            ex_user = await self._db.users.get_user_with_hash_password(email=data.email)

        except ObjectNotFoundException:
            raise UserLoginException

        if not (self.verify_password(data.password, ex_user.hash_password)):
            raise UserLoginException

        access_token = self.create_token({"user_id": ex_user.id})

        return access_token


