import logging

from elasticsearch import AsyncElasticsearch

from backend.src.config import settings


_client: AsyncElasticsearch | None = None

def get_es_client() -> AsyncElasticsearch:
    global _client
    if _client is None:
        _client = AsyncElasticsearch(
            settings.ES_HOST,
            basic_auth=("elastic", settings.ES_PASSWORD),
            verify_certs=False # при проде добавить надо будет, ну указать True
        )
        logging.info(f"Connected to ES at {settings.ES_HOST}")
    return _client

async def close_es_client():
    global _client
    if _client:
        await _client.close()
        _client = None





