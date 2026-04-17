from backend.src.models.photos_url import PhotosUrlOrm
from backend.src.repositories.base import BaseRepository
from backend.src.repositories.mappers.mappers import PhotosUrlMapper


class PhotosUrlRepository(BaseRepository):
    def __init__(self, session):
        super().__init__(session, PhotosUrlOrm)

    mapper = PhotosUrlMapper