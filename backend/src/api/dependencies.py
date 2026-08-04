from typing import Annotated
from fastapi import Request, Query, HTTPException

from fastapi.params import Depends
from pydantic import BaseModel

from backend.src.database import async_session_maker
from backend.src.services.auth import AuthService
from backend.src.utils.database import DBManager
from backend.src.utils.exceptions import TokenExpiredException


async def get_db():
    async with DBManager(async_session_maker) as db:
        yield db

DBDep = Annotated[DBManager, Depends(get_db)]


def get_token(request: Request):
    token = request.cookies.get("access_token", None)
    return token

def get_payload(token: Annotated[str | None, Depends(get_token)]):
    try:
        payload = AuthService().decode_token(token)
    except TokenExpiredException:
        raise HTTPException(status_code=403, detail="Токен протух")
    return payload


def require_admin(payload: Annotated[dict | None, Depends(get_payload)]):
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещен")

RequireAdminDep = Annotated[None, Depends(require_admin)]

def get_user_id(token: str = Depends(get_token)):
    if token is None:
        return None
    try:
        payload = AuthService().decode_token(token)
    except TokenExpiredException:
        raise HTTPException(status_code=403, detail="Токен протух")
    return payload["user_id"]

user_idDep_optional = Annotated[int | None, Depends(get_user_id)]

def get_current_user_id(user_id: int | None = Depends(get_user_id)):
    if user_id is None:
        raise HTTPException(status_code=401, detail="Сначала авторизуйтесь")

    return user_id

user_idDep = Annotated[int, Depends(get_current_user_id)]




class PaginationParams(BaseModel):
    page: Annotated[int | None, Query(default=1, ge=1)]
    per_page: Annotated[int | None, Query(default=3, ge=1, le=30)]


PaginationDep = Annotated[PaginationParams, Depends()]