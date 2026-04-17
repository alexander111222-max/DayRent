
from backend.src.repositories.categories import CategoriesRepository
from backend.src.repositories.item_photos import ItemPhotosRepository
from backend.src.repositories.items import ItemRepository
from backend.src.repositories.photos_url import PhotosUrlRepository
from backend.src.repositories.users import UserRepository


class DBManager:

    def __init__(self, session_factory):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session = self.session_factory()

        self.users = UserRepository(self.session)
        self.items = ItemRepository(self.session)
        self.item_photos = ItemPhotosRepository(self.session)
        self.photos_url = PhotosUrlRepository(self.session)
        self.categories = CategoriesRepository(self.session)


        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.rollback()
        await self.session.close()

    async def commit(self):
        await self.session.commit()



