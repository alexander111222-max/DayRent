from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from backend.src.api.users import router as router_users
from backend.src.api.auth import router as router_auth
from backend.src.api.items import router as router_items
from backend.src.api.categories import router as router_categories
from backend.src.connectors.elastic_connector import close_es_client, get_es_client
from backend.src.services.search import ensure_index


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_es_client()
    await ensure_index()
    yield
    await close_es_client()


app = FastAPI(debug=True)


app.include_router(router_users)
app.include_router(router_auth)
app.include_router(router_items)
app.include_router(router_categories)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)

