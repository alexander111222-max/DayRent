


from fastapi import APIRouter

from src.api.dependencies import DBDep
from src.schemas.users import UserAddRequestSchema
from src.services.users import UserService

router = APIRouter(prefix="/user")


@router.post("/add")
async def add_user(data: UserAddRequestSchema, db: DBDep):

    added_user = await UserService(db).add_one(data)

    return {"added_user": added_user}


