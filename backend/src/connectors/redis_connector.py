import logging
import redis.asyncio as redis


class RedisManager:
    _redis: redis.Redis

    def __init__(self, host: str = "localhost", port: int = 6379):
        self.host = host
        self.port = port

    async def connect(self):
        logging.info(f"Подключаюсь к Redis host={self.host}, port={self.port}")
        self._redis = redis.Redis(host=self.host, port=self.port, decode_responses=True)
        # Проверка подключения
        try:
            await self._redis.ping()
            logging.info(
                f"Успешное подключение к Redis host={self.host}, port={self.port}"
            )
        except Exception as e:
            logging.error(f"Не удалось подключиться к Redis: {e}")
            raise

    async def set(self, key: str, value: str, expire: int | None = None):
        if expire:
            await self._redis.set(key, value, ex=expire)
        else:
            await self._redis.set(key, value)

    async def get(self, key: str):
        return await self._redis.get(key)

    async def delete(self, key: str):
        await self._redis.delete(key)

    async def close(self):
        if self._redis:
            await self._redis.close()
