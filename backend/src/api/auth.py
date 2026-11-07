import asyncio
import logging
from random import randint
from fastapi import APIRouter, HTTPException
from fastapi import Response, Request
from faststream.rabbit import RabbitExchange, ExchangeType
from slowapi import Limiter
from slowapi.util import get_remote_address


from backend.src.api.dependencies import DBDep, user_idDep
from backend.src.config import settings
from backend.src.connectors.rebbit_mq import broker
from backend.src.schemas.email import ResendCodeEmailSchema, VerifyEmailSchema
from backend.src.schemas.users import UserAddRequestSchema, UserLoginSchema, UserPatchSchema
from backend.src.services.refresh_tokens import RefreshTokensService
from backend.src.services.users import UserService
from backend.src.tasks.tasks_geocode import geocode_user
from backend.src.services.auth import AuthService
from backend.src.utils.exceptions import UserAlreadyExistsException, WrongPasswordException, \
    UserNotFoundException, InvalidTokenException, TokenExpiredException
from backend.src.utils.init import redis_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

notification_exchange = RabbitExchange(name="notification_exchange", type=ExchangeType.TOPIC)

limiter = Limiter(key_func=get_remote_address)

COOKIE_SECURE = settings.MODE == "PROD"

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
        user = await UserService(db).get_user_filter_by(email=data.email)
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Email не подтвержден")
        payload = AuthService().decode_token(access_token)
        refresh_token = await RefreshTokensService(db).create_refresh_token(payload["user_id"])
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
        secure=COOKIE_SECURE,
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_TTL_DAYS * 24 * 3600,
        httponly=True,
        secure=COOKIE_SECURE,
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
        secure=COOKIE_SECURE,
        samesite="lax",
    )
    logger.info("Access токен успешно обновлён")
    return {"status": "ok"}


@router.post("/resend_code")
@limiter.limit("3/minute")
async def resend_code(request: Request, data: ResendCodeEmailSchema, db: DBDep):
    try:
        user = await UserService(db).get_user_filter_by(email=data.email)
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.is_verified:
        raise HTTPException(400, detail="Почта уже подтверждена")
    code = str(randint(100000, 999999))
    await redis_manager.set(f"verify_code:{user.id}", code, 600)
    data_verify = {
        "event": "send_verify_code",
        "email": user.email,
        "code": code
    }
    await broker.publish(
        message=data_verify,
        exchange=notification_exchange,
        routing_key="email.verify_code",
        content_type="application/json"
    )
    return {"success": True}



@router.post("/verify_email")
@limiter.limit("10/minute")
async def verify_email(request: Request, data: VerifyEmailSchema, db: DBDep):
    try:
        user = await UserService(db).get_user_filter_by(email=data.email)
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.is_verified:
        raise HTTPException(400, detail="Почта уже подтверждена")
    attempts_key = f"verify_attempts:{user.id}"
    attempts = await redis_manager.incr(attempts_key)
    if attempts == 1:
        await redis_manager.expire(attempts_key, 600)
    if attempts > 5:
        raise HTTPException(429, detail="Слишком много попыток, запросите новый код")
    code_from_redis = await redis_manager.get(f"verify_code:{user.id}")
    if code_from_redis != str(data.code):
        raise HTTPException(status_code=403, detail="Неверный код")
    await UserService(db).modify_user(UserPatchSchema(is_verified=True), user_id=user.id, id=user.id)
    await redis_manager.delete(f"verify_code:{user.id}")
    await redis_manager.delete(attempts_key)
    return {"verify": True}