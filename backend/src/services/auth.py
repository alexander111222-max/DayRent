import time
from datetime import timedelta, timezone, datetime

import jwt
from jwt import ExpiredSignatureError
from pwdlib import PasswordHash

from backend.src.config import settings
from backend.src.utils.exceptions import TokenExpiredException


class AuthService:

    pwd_context = PasswordHash.recommended()

    def create_token(self, payload: dict) -> str:

        to_encode = payload.copy()

        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

        return encoded_jwt

    def decode_token(self, token):

        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
        except ExpiredSignatureError:
            raise TokenExpiredException("Токен протух")

        user_id = payload["user_id"]
        return user_id

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)


    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)




