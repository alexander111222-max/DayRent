# utils/image.py
from functools import partial
from io import BytesIO
import asyncio
from PIL import Image

from backend.src.utils.s3 import s3_client

PHOTO_SIZES = {
    (240, 240): "small",
    (1000, 750): "medium",
    (1550, 1200): "large",
}


async def _resize_and_upload(
    image: Image.Image,
    dimensions: tuple[int, int],
    label: str,
    item_id: int,
    photo_id: int,
) -> tuple[str, str]:
    loop = asyncio.get_running_loop()
    width, height = dimensions

    resized = await loop.run_in_executor(
        None, partial(image.resize, (width, height), Image.LANCZOS)
    )

    buffer = BytesIO()
    await loop.run_in_executor(None, partial(resized.save, buffer, format="JPEG"))
    buffer.seek(0)

    key = f"{item_id}/{photo_id}/{width}x{height}.jpg"
    url = await s3_client.upload_file(buffer, key)

    return url, label


async def process_and_upload(
    file_io: BytesIO,
    item_id: int,
    photo_id: int,
) -> list[tuple[str, str]]:

    loop = asyncio.get_running_loop()

    file_io.seek(0)
    image = await loop.run_in_executor(None, Image.open, file_io)
    # Image.open — ленивый, load() форсирует чтение до закрытия буфера
    await loop.run_in_executor(None, image.load)

    tasks = [
        _resize_and_upload(image, dimensions, label, item_id, photo_id)
        for dimensions, label in PHOTO_SIZES.items()
    ]
    return await asyncio.gather(*tasks)