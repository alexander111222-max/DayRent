from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from faststream.rabbit import RabbitBroker

from backend.src.admin.admin import setup_admin
from backend.src.api.users import router as router_users
from backend.src.api.auth import router as router_auth
from backend.src.api.items import router as router_items
from backend.src.api.categories import router as router_categories
from backend.src.api.search import router as router_search
from backend.src.api.bookings import router as router_bookings
from backend.src.api.baskets import router as router_baskets
from backend.src.api.profiles import router as router_profiles
from backend.src.connectors.elastic_connector import close_es_client, get_es_client
from backend.src.connectors.rebbit_mq import broker
from backend.src.services.search import ensure_index

@asynccontextmanager
async def lifespan(app: FastAPI):
    await broker.start()
    get_es_client()
    await ensure_index()
    yield
    await broker.stop()
    await close_es_client()


app = FastAPI(debug=True, lifespan=lifespan)
setup_admin(app)

app.include_router(router_users)
app.include_router(router_auth)
app.include_router(router_items)
app.include_router(router_categories)
app.include_router(router_search)
app.include_router(router_bookings)
app.include_router(router_baskets)
app.include_router(router_profiles)




if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)

