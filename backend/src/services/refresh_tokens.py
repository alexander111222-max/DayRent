from backend.src.config import settings
from backend.src.schemas.refresh_tokens import RefreshTokenAddSchema
from backend.src.services.auth import AuthService
from backend.src.services.base import BaseService
from backend.src.utils.exceptions import UserNotFoundException, InvalidTokenException, NoResultFoundException, \
    TokenExpiredException
from datetime import datetime, timezone, timedelta


class RefreshTokensService(BaseService):

    async def create_refresh_token(self, user_id: int) -> str:
        await self._db.refresh_tokens.delete_by_user_id(user_id)

        token = AuthService().create_token(
            payload={"user_id": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_TTL_DAYS)})
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_TTL_DAYS)

        await self._db.refresh_tokens.add_one(RefreshTokenAddSchema(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        ))
        await self._db.commit()
        return token

    async def refresh_access_token(self, refresh_token: str):
        token_obj = await self._db.refresh_tokens.get_by_token(refresh_token)
        if not token_obj:
            raise InvalidTokenException

        if token_obj.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            await self._db.refresh_tokens.delete_by_user_id(token_obj.user_id)
            await self._db.commit()
            raise InvalidTokenException

        try:
            user_id = AuthService().decode_token(refresh_token)
        except TokenExpiredException:
            raise TokenExpiredException

        try:
            user = await self._db.users.get_one(id=user_id)
        except NoResultFoundException:
            raise UserNotFoundException


        access_token = AuthService().create_token({"user_id": user.id, "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.TTL)})
        return access_token

    async def revoke_refresh_token(self, user_id: int):
        await self._db.refresh_tokens.delete_by_user_id(user_id)
        await self._db.commit()