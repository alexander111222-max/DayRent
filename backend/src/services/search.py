import logging

from unicodedata import category

from backend.src.api.dependencies import PaginationParams
from backend.src.config import settings
from backend.src.connectors.elastic_connector import get_es_client
from backend.src.schemas.search import DocumentIn, DocumentUpdate, SearchRequestSchema, SearchHit, SearchResponse
from backend.src.utils.exceptions import UserLocationNotReadyException

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


async def search(req: SearchRequestSchema, pag_params: PaginationParams):
    es = get_es_client()
    offset = (pag_params.page - 1) * pag_params.per_page
    limit = pag_params.per_page

    must_clauses = []
    filter_clauses = []

    if req.query:
        must_clauses.append({
            "multi_match": {
                "query": req.query,
                "fields": ["title^2", "description"],
                "fuzziness": "AUTO"
            }
        })

    if req.price_from or req.price_to:
        range_query = {}
        if req.price_from:
           range_query["gte"] = req.price_from
        if req.price_to:
            range_query["lte"] = req.price_to

        filter_clauses.append({"range": {"price": range_query}})

    if req.city:
        filter_clauses.append({"term": {"city": req.city}})

    if req.category_id:
        filter_clauses.append({"term": {"category_id": req.category_id}})

    if req.nearby:
        if req.location.lat is None or req.location.lon is None:
            raise UserLocationNotReadyException
        filter_clauses.append({
            "geo_distance": {
                "distance": "3km",
                "location": req.location.model_dump()
            }
        })

    query = {
        "bool": {
            "must": must_clauses,
            "filter": filter_clauses
        }
    }

    response = await es.search(
        index=settings.ES_INDEX,
        query=query,
        from_=offset,
        size=limit
    )
    hits = response["hits"]["hits"]
    total = response["hits"]["total"]["value"]
    results = [
        SearchHit(
            id=hit["_id"],
            score=hit["_score"],
            title=hit["_source"]["title"],
            description=hit["_source"]["description"],
            city=hit["_source"]["city"],
            price=hit["_source"]["price"],
            created_at=hit["_source"]["created_at"]
        )
        for hit in hits
    ]

    return SearchResponse(total=total, results=results)




