from pydantic import BaseModel, ConfigDict

from src.models.photos_url import PhotoSize


class PhotosUrlSchema(BaseModel):
    id: int
    photo_id: int
    url: str
    size: PhotoSize

    model_config = ConfigDict(from_attributes=True)

class PhotosUrlAddSchema(BaseModel):
    photo_id: int
    url: str
    size: PhotoSize