import logging

from backend.src.config import settings
from backend.src.connectors.elastic_connector import get_es_client
from backend.src.schemas.search import DocumentIn, DocumentUpdate

INDEX_SETTINGS = {
    "mappings": {
        "properties": {
            # ищем по тексту — type: text
            "title":       {"type": "text"},
            "description": {"type": "text"},

            # фильтруем точно — type: keyword
            "city":        {"type": "keyword"},
            "category_id": {"type": "keyword"},

            # диапазон цен — type: integer
            "price":       {"type": "integer"},

            # гео поиск — специальный тип
            "location": {"type": "geo_point"},

            # дата
            "created_at":  {"type": "date"},
        }
    }
}

async def ensure_index():
    es = get_es_client()
    index = es.indices.exists(index=settings.ES_INDEX)
    if not index:
        logging.info("Создан индекс")
        await es.indices.create(index=settings.ES_INDEX, body=INDEX_SETTINGS)


async def create_doc(doc_id: int, doc: DocumentIn):
    es = get_es_client()
    await es.index(
        index=settings.ES_INDEX,
        id=str(doc_id),
        document=doc.model_dump()
    )
    return doc_id

async def update_doc(doc_id: int, doc: DocumentUpdate):
    es = get_es_client()
    await es.update(
        index=settings.ES_INDEX,
        id=str(doc_id),
        doc=doc.model_dump(exclude_unset=True)
    )
    return doc_id


async def search():
    ...
