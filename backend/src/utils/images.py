# utils/image.py
from functools import partial
from io import BytesIO
import asyncio
from PIL import Image, ImageOps
import logging
logger = logging.getLogger(__name__)
from backend.src.connectors.s3 import s3_client

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
    logger.debug(f"Фото по url {key} успешно загружено")
    return url, label


def to_rgb(img: Image.Image) -> Image.Image:
    if img.mode == "RGB":
        return img
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        return background
    return img.convert("RGB")


def _prepare_image(file_io: BytesIO) -> Image.Image:
    file_io.seek(0)
    image = Image.open(file_io)
    image.load()                          # форсируем чтение, пока буфер жив
    image = ImageOps.exif_transpose(image) # поворот по EXIF (фото с телефона)
    return to_rgb(image)                   # RGBA/P/CMYK → RGB для JPEG


async def process_and_upload(
    file_io: BytesIO,
    item_id: int,
    photo_id: int,
) -> list[tuple[str, str]]:
    loop = asyncio.get_running_loop()

    image = await loop.run_in_executor(None, _prepare_image, file_io)

    tasks = [
        _resize_and_upload(image, dimensions, label, item_id, photo_id)
        for dimensions, label in PHOTO_SIZES.items()
    ]
    return await asyncio.gather(*tasks)