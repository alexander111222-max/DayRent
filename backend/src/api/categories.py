from fastapi import APIRouter

from backend.src.api.dependencies import DBDep
from backend.src.schemas.categories import CategoryAddSchema
from backend.src.services.categories import CategoriesService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/")
async def add_category(data: CategoryAddSchema, db: DBDep):
    added_category = await CategoriesService(db).add_category(data)
    return added_category


@router.delete("/{category_id}")
async def delete_category(category_id: int, db: DBDep):
    deleted_category = await CategoriesService(db).delete_category(id=category_id)
    return deleted_category


@router.get("/")
async def get_category_by_id(db: DBDep):
    category = await CategoriesService(db).get_category_by_filter()
    return category

@router.get("/{category_id}")
async def get_category_by_id(category_id: int, db: DBDep):
    category = await CategoriesService(db).get_category_by_filter(id=category_id)
    return category


