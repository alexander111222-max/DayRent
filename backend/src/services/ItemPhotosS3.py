from enum import Enum

from backend.src.connectors.s3 import AsyncS3Client

class SizePhotos(str, Enum):
    SMALL = '240x240'
    MEDIUM = '1000x750'
    LARGE = '1550x1200'



class ItemPhotosS3Manager:

    def __init__(self, s3_client: AsyncS3Client):
        self._s3_client = s3_client

    @staticmethod
    def _build_keys(item_id: int, photo_id: int, size: SizePhotos):
        return f"{item_id}/{photo_id}/{size.value}.jpg"


    async def get_photos(self, item_id: int, photos_ids: list[int], size: SizePhotos) -> list:
        keys = [self._build_keys(item_id, photo_id, size) for photo_id in photos_ids]
        keys_and_urls = await self._s3_client.get_presigned_urls(keys, 3600)
        urls = keys_and_urls.values()
        zip_id_url = list(zip(photos_ids, urls))
        return zip_id_url

    async def get_one_photo(self, item_id: int, photo_id: int, size: SizePhotos):
        key = self._build_keys(item_id, photo_id, size)
        key_and_url = await self._s3_client.get_presigned_urls([key], 3600)
        url = list(key_and_url.values())[0]
        return url



