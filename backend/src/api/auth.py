import asyncio
import logging
from fastapi import APIRouter, HTTPException
from fastapi import Response
from starlette.requests import Request

from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.config import settings
from backend.src.schemas.users import UserAddRequestSchema, UserLoginSchema
from backend.src.services.refresh_tokens import RefreshTokensService
from backend.src.services.users import UserService
from backend.src.tasks.tasks_geocode import geocode_user
from backend.src.services.auth import AuthService
from backend.src.utils.exceptions import UserAlreadyExistsException, WrongPasswordException, \
    UserNotFoundException, InvalidTokenException, TokenExpiredException

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(data: UserAddRequestSchema, db: DBDep):
    try:
        added_user = await UserService(db).register(data)
    except WrongPasswordException:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")
    except UserAlreadyExistsException:
        logger.warning(f"Регистрация отклонена - email уже занят: {data.email}")
        raise HTTPException(status_code=409, detail="Пользователь с таким email уже существует")

    logger.info(f"Зарегистрирован пользователь с email {data.email}")
    geocode_user.delay(added_user.id, added_user.address)

    return {"added_user": added_user}


@router.post("/login")
async def login(data: UserLoginSchema, response: Response, db: DBDep):
    logger.info(f"Попытка входа пользователя с email: {data.email}")
    try:
        access_token = await UserService(db).login(data)
        user_id = AuthService().decode_token(access_token)
        refresh_token = await RefreshTokensService(db).create_refresh_token(user_id)
    except UserNotFoundException:
        logger.warning(f"Вход отклонён - пользователь не найден: {data.email}")
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    except WrongPasswordException:
        logger.warning(f"Вход отклонён - неверный пароль: {data.email}")
        raise HTTPException(status_code=401, detail="Неверный пароль")

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.TTL * 60,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_TTL_DAYS * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    logger.info(f"Пользователь успешно вошёл: {data.email}")
    return {"status": "ok"}


@router.post("/logout")
async def logout(response: Response, db: DBDep, user_id: user_idDep):
    await RefreshTokensService(db).revoke_refresh_token(user_id)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    logger.info(f"Выполнен выход пользователя")

    return {"Logout":"Ok"}


@router.post(
    "/refresh",
    summary="Обновить access токен",
    description="Использует refresh_token из куки для выдачи нового access_token без повторного логина"
)
async def refresh_tokens(response: Response, request: Request, db: DBDep):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh токен отсутствует")

    logger.info("Попытка обновления access токена")
    try:
        access_token = await RefreshTokensService(db).refresh_access_token(refresh_token)
    except (InvalidTokenException, UserNotFoundException, TokenExpiredException) as e:
        logger.warning(f"Обновление токена отклонено - невалидный refresh токен. Причина: {e}")
        raise HTTPException(status_code=401, detail=f"Невалидный или истёкший refresh токен. Причина: {e}")

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=3600,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    logger.info("Access токен успешно обновлён")
    return {"status": "ok"}
