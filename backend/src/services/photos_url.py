from backend.src.schemas.photos_url import PhotosUrlAddSchema
from backend.src.services.base import BaseService


class PhotosUrlService(BaseService):
    def __init__(self, db):
        super().__init__(db)

    async def add_one(self, data: PhotosUrlAddSchema):
        photo_url = await self._db.photos_url.add_one(data)
        return photo_url