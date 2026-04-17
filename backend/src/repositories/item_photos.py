from backend.src.models.item_photos import ItemPhotosOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import ItemPhotosMapper


class ItemPhotosRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, ItemPhotosOrm)

    mapper = ItemPhotosMapper