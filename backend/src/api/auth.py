import asyncio
import logging
from fastapi import APIRouter, HTTPException
from fastapi import Response

from backend.src.api.dependencies import DBDep
from backend.src.schemas.users import UserAddRequestSchema, UserLoginSchema
from backend.src.tasks.tasks_geocode import geocode_user
from backend.src.services.auth import AuthService
from backend.src.utils.exceptions import UserLoginException
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(data: UserAddRequestSchema, db: DBDep):

    added_user = await AuthService(db).register_user(data)
    logger.info(f"Зарегистрирован пользователь с email {data.email}")
    geocode_user.delay(added_user.id, added_user.address)

    return {"added_user": added_user}


@router.post("/login")
async def login(data: UserLoginSchema, response: Response, db: DBDep):

    try:
        access_token = await AuthService(db).login_user(data)

    except UserLoginException:
        logger.debug(f"Неудачный вход юзера с email {data.email}, такого email не существует")
        raise HTTPException(status_code=400, detail="Пользователь не найден или неверный пароль")

    response.set_cookie("access_token", access_token)
    logger.info(f"Логин пользователя с email {data.email}")
    return {"Login": "Ok"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    logger.info(f"Выполнен выход пользователя")
    return {"Logout":"Ok"}


