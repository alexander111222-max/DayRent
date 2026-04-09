from src.models.items import ItemsOrm
from src.repositories.base import BaseRepository
from src.repositories.mappers.mappers import ItemDataMapper


class ItemRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, ItemsOrm)

    mapper = ItemDataMapper

