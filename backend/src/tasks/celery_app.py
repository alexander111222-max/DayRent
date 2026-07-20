import nest_asyncio
from celery.schedules import crontab

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

celery_instance.conf.beat_schedule = {
    "change-to-completed": {
        "task": "change_to_completed",
        "schedule": crontab(minute=1, hour=0)
    },
    "change-to-active": {
        "task": "change_to_active",
        "schedule": crontab(minute=1, hour=0)
    }
}