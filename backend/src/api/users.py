
from fastapi import APIRouter, HTTPException


from backend.src.api.dependencies import DBDep
from backend.src.services.users import UserService
from backend.src.utils.exceptions import UserNotFoundException



router = APIRouter(prefix="/user", tags=["users"])



@router.delete("/{user_id}")
async def delete_user(user_id: int, db: DBDep):
    deleted_user = await UserService(db).delete_user(id=user_id)
    return deleted_user




@router.get("/{user_id}")
async def get_user(db: DBDep, user_id: int):
    try:
        user = await UserService(db).get_user(id=user_id)
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user





