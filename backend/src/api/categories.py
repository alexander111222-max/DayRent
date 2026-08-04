import logging
from typing import Annotated

from fastapi import APIRouter, Path, HTTPException

from backend.src.api.dependencies import DBDep, RequireAdminDep
from backend.src.schemas.categories import CategoryAddSchema
from backend.src.services.categories import CategoriesService
from backend.src.utils.exceptions import CategoryNotFoundException
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/")
async def add_category(data: CategoryAddSchema, db: DBDep, req_admin: RequireAdminDep):
    added_category = await CategoriesService(db).add_category(data)
    return added_category


@router.delete("/{category_id}")
async def delete_category(category_id: Annotated[int, Path(ge=1, le=2147483647)], db: DBDep, req_admin: RequireAdminDep):
    try:
        deleted_category = await CategoriesService(db).delete_category(id=category_id)
    except CategoryNotFoundException:
        logger.warning("Попытка удалить несуществующую категорию")
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return deleted_category


@router.get("/")
async def get_categories(db: DBDep):
    categories = await CategoriesService(db).get_all_categories()
    return categories

@router.get("/{category_id}")
async def get_category_by_id(category_id: Annotated[int, Path(ge=1, le=2147483647)], db: DBDep):
    category = await CategoriesService(db).get_category_by_filter(id=category_id)
    return category


