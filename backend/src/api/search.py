
from fastapi import APIRouter, HTTPException

from backend.src.api.dependencies import PaginationDep, user_idDep, DBDep
from backend.src.schemas.search import SearchRequestSchema, Location
from backend.src.services.items import ItemsService
from backend.src.services.search import search
from backend.src.services.users import UserService
from backend.src.utils.exceptions import UserLocationNotReadyException

router = APIRouter(prefix="/search", tags=["search"])



@router.get("/")
async def search_items(
        pagination_param: PaginationDep,
        user_id: user_idDep,
        db: DBDep,
        query: str | None = None,
        price_from: int | None = None,
        price_to: int | None = None,
        city: str | None = None,
        category_id: int | None = None,
        nearby: bool | None = None
        ):

    user = await UserService(db).get_user(id=user_id)
    location = Location(lat=user.lat,
                        lon=user.lon)
    req = SearchRequestSchema(
        query=query,
        price_from=price_from,
        price_to=price_to,
        city=city,
        location=location,
        category_id=category_id,
        nearby=nearby
    )
    try:
        result_search = await search(req, pagination_param)
        ids = []
        results = result_search.results
        for obj in results:
            ids.append(obj.id)
        items = await ItemsService(db).get_items_by_ids(ids)
    except UserLocationNotReadyException:
        raise HTTPException(status_code=409, detail="Ваше местонахождение еще не обновилось, подождите пару секунд")
    return result_search.total, items