
from fastapi import APIRouter, HTTPException


from src.api.dependencies import DBDep
from src.services.users import UserService
from src.utils.exceptions import UserNotFoundException



router = APIRouter(prefix="/user")

@router.get("/{user_id}")
async def get_user(db: DBDep, user_id: int):
    try:
        user = await UserService(db).get_user(id=user_id)
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user







