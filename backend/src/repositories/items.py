from backend.src.models.items import ItemsOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import ItemDataMapper


class ItemRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, ItemsOrm)

    mapper = ItemDataMapper

