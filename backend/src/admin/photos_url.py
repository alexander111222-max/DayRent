from sqladmin import ModelView

from backend.src.models.photos_url import PhotosUrlOrm


class PhotosUrlAdmin(ModelView, model=PhotosUrlOrm):
    pass

