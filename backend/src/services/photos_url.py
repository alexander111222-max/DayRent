from backend.src.schemas.photos_url import PhotosUrlAddSchema
from backend.src.services.base import BaseService


class PhotosUrlService(BaseService):
    def __init__(self, db):
        super().__init__(db)

    async def add_one(self, data: PhotosUrlAddSchema):
        photo_url = await self._db.photos_url.add_one(data)
        await self._db.commit()
        return photo_url


    async def get_filter_by(self, *filters, **filter_by):
        photos_utl = await self._db.photos_url.get_filter_by(*filters, **filter_by)
        return photos_utl