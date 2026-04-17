from backend.src.config import settings
from backend.src.connectors.redis_connector import RedisManager


redis_manager = RedisManager(
    port=settings.REDIS_PORT,
    host=settings.REDIS_HOST,
)
