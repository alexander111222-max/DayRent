import nest_asyncio
nest_asyncio.apply()
from celery import Celery

from backend.src.config import settings

celery_instance = Celery(
    "tasks",
    broker=settings.REDIS_URL,
    include=[
        "backend.src.tasks.tasks_geocode",
        "backend.src.tasks.tasks_photos",
    ]
)