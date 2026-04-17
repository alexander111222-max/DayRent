from backend.src.models.categories import CategoriesOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import CategoriesMapper


class CategoriesRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, CategoriesOrm)

    mapper = CategoriesMapper