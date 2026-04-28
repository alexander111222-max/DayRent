import asyncio

from fastapi import APIRouter, HTTPException
from fastapi import Response

from backend.src.api.dependencies import DBDep
from backend.src.schemas.users import UserAddRequestSchema, UserLoginSchema
from backend.src.tasks.tasks_geocode import geocode_user
from backend.src.services.auth import AuthService
from backend.src.utils.exceptions import UserLoginException

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(data: UserAddRequestSchema, db: DBDep):

    added_user = await AuthService(db).register_user(data)

    geocode_user.delay(added_user.id, added_user.address)

    return {"added_user": added_user}


@router.post("/login")
async def login(data: UserLoginSchema, response: Response, db: DBDep):

    try:
        access_token = await AuthService(db).login_user(data)

    except UserLoginException:
        raise HTTPException(status_code=400, detail="Пользователь не найден или неверный пароль")

    response.set_cookie("access_token", access_token)

    return {"Login": "Ok"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"Logout":"Ok"}

