import asyncio

from PIL import Image
from io import BytesIO

from src.utils.s3 import s3_client

from functools import partial


async def process_and_upload(file_io, item_id: int, photo_id: int):
    sizes = {(240, 240): "small", (1000, 750): "medium", (1550, 1200): "large"}

    file_io.seek(0)

    loop = asyncio.get_event_loop()
    image = await loop.run_in_executor(None, Image.open, file_io)

    for (width, height), label in sizes.items():
        resized = await loop.run_in_executor(
            None,
            lambda: image.resize((width, height), Image.LANCZOS)
        )

        buffer = BytesIO()
        await loop.run_in_executor(None, partial(resized.save, buffer, format="JPEG"))

        buffer.seek(0)
        key = f"{item_id}/{photo_id}/{width}x{height}.jpg"
        url = await s3_client.upload_file(buffer, key)

        yield url, label




