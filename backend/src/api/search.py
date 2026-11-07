from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from backend.src.api.dependencies import PaginationDep, DBDep, user_idDep_optional
from backend.src.connectors.s3 import s3_client
from backend.src.schemas.items import ItemSchemaWithMainPhotoUrl, SearchResponseSchema
from backend.src.schemas.search import SearchRequestSchema, Location
from backend.src.services.ItemPhotosS3 import ItemPhotosS3Manager, SizePhotos
from backend.src.services.item_photos import ItemPhotosService
from backend.src.services.items import ItemsService
from backend.src.services.search import search
from backend.src.services.users import UserService
from backend.src.utils.exceptions import UserLocationNotReadyException, UserAuthError
import logging

from backend.src.utils.item_photos import get_item_with_main_photo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=SearchResponseSchema)
async def search_items(
        pagination_param: PaginationDep,
        user_id: user_idDep_optional,
        db: DBDep,
        query: str | None = None,
        price_from: Annotated[int | None, Query(ge=1, le=2147483647)] = None,
        price_to: Annotated[int | None, Query(ge=1, le=2147483647)] = None,
        city: str | None = None,
        category_id: Annotated[int | None, Query(ge=1, le=2147483647)] = None,
        nearby: bool | None = None
        ):
    if user_id is not None:
        user = await UserService(db).get_user_filter_by(id=user_id)
        location = Location(lat=user.lat,
                            lon=user.lon)
    else:
        location = Location(lat=None,
                            lon=None)
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
        result_search = await search(req, pagination_param, user_id)
        ids = []
        results = result_search.results
        for obj in results:
            ids.append(int(obj.id))

        items = await ItemsService(db).get_items_by_ids(ids)

        new_items = await get_item_with_main_photo(items, db, ids)
    except UserLocationNotReadyException:
        logger.warning(f"Попытка выолнить поиск ближайших обьявлений без координат user_id: {user_id}")
        raise HTTPException(status_code=409, detail="Ваше местонахождение еще не обновилось, подождите пару секунд")
    except UserAuthError:
        logger.debug(f"Попытка выолнить поиск ближайших обьявлений без авторизации user_id: {user_id}")
        raise HTTPException(status_code=401, detail="Пожалуйста авторизируйтесь")

    return SearchResponseSchema(total=result_search.total, items=new_items)