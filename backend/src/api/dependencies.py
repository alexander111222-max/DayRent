from typing import Annotated
from fastapi import Request, Query

from fastapi.params import Depends
from pydantic import BaseModel

from backend.src.database import async_session_maker
from backend.src.services.auth import AuthService
from backend.src.utils.database import DBManager


async def get_db():
    async with DBManager(async_session_maker) as db:
        yield db

DBDep = Annotated[DBManager, Depends(get_db)]


def get_token(request: Request):
    token = request.cookies.get("access_token", None)
    return token

def get_user_id(db: DBDep, token: str = Depends(get_token)):
    user_id = AuthService(db).decode_token(token)
    return user_id

user_idDep = Annotated[int, Depends(get_user_id)]




class PaginationParams(BaseModel):
    page: Annotated[int | None, Query(default=1, ge=1)]
    per_page: Annotated[int | None, Query(default=3, ge=1, le=30)]


PaginationDep = Annotated[PaginationParams, Depends()]