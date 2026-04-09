from src.models.item_photos import ItemPhotosOrm
from src.models.photos_url import PhotosUrlOrm
from src.repositories.item_photos import ItemPhotosRepository
from src.repositories.items import ItemRepository
from src.repositories.photos_url import PhotosUrlRepository
from src.repositories.users import UserRepository


class DBManager:

    def __init__(self, session_factory):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session = self.session_factory()

        self.users = UserRepository(self.session)
        self.items = ItemRepository(self.session)



        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.rollback()
        await self.session.close()

    async def commit(self):
        await self.session.commit()



