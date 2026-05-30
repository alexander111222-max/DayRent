import logging
from typing import BinaryIO

from aiobotocore.session import get_session
from botocore.exceptions import ClientError

from backend.src.config import settings


logger = logging.getLogger(__name__)


class AsyncS3Client:
    def __init__(
        self,
        access_key: str,
        secret_key: str,
        endpoint_url: str,
        bucket_name: str,
    ):
        self.bucket_name = bucket_name
        self.endpoint_url = endpoint_url.rstrip("/")
        self.access_key = access_key
        self.secret_key = secret_key

    async def _get_client(self):
        session = get_session()

        return session.create_client(
            "s3",
            region_name="ru-central1",
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.endpoint_url,
            verify=False,
        )

    def _extract_key_from_url(self, url: str) -> str:
        prefix = f"{self.endpoint_url}/{self.bucket_name}/"
        return url.replace(prefix, "")

    def _build_url(self, key: str) -> str:
        return f"{self.endpoint_url}/{self.bucket_name}/{key}"

    async def upload_file(self, file: BinaryIO, key: str) -> str:
        async with (await self._get_client()) as client:
            try:
                await client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=file
                )

                logger.info(
                    "File uploaded to S3 successfully. key=%s",
                    key
                )

                return self._build_url(key)

            except ClientError:
                logger.exception(
                    "Failed to upload file to S3. key=%s",
                    key
                )
                raise

    async def delete_file_by_url(self, file_url: str):
        key = self._extract_key_from_url(file_url)

        async with (await self._get_client()) as client:
            try:
                await client.delete_object(
                    Bucket=self.bucket_name,
                    Key=key
                )

                logger.info(
                    "File deleted from S3 successfully. key=%s",
                    key
                )

            except ClientError:
                logger.exception(
                    "Failed to delete file from S3. key=%s",
                    key
                )
                raise

    async def download_file_by_url(
        self,
        file_url: str,
        destination_path: str
    ):
        key = self._extract_key_from_url(file_url)

        async with (await self._get_client()) as client:
            try:
                response = await client.get_object(
                    Bucket=self.bucket_name,
                    Key=key
                )

                async with response["Body"] as stream:
                    data = await stream.read()

                with open(destination_path, "wb") as f:
                    f.write(data)

                logger.info(
                    "File downloaded from S3 successfully. key=%s",
                    key
                )

            except ClientError:
                logger.exception(
                    "Failed to download file from S3. key=%s",
                    key
                )
                raise


s3_client = AsyncS3Client(
    access_key=settings.ACCESS_KEY_S3,
    secret_key=settings.SECRET_KEY_S3,
    endpoint_url="https://s3.storage.selcloud.ru",
    bucket_name="dayrent",
)