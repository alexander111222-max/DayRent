import httpx

from backend.src.config import settings
from backend.src.utils.exceptions import YandexGeocoderUnavailableException, YandexGeocoderAddressNotFoundException


class YandexGeocoder:
    def __init__(self, url: str, api_key: str):
        self._url = url
        self._api_key = api_key

    async def get_coordinates(self, address: str):
        params = {
            "apikey": self._api_key,
            "geocode": address,
            "format": "json"
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url=self._url, params=params)
        except httpx.RequestError:
            raise YandexGeocoderUnavailableException("Яндекс геокодер недоступен")

        data = resp.json()
        members = data["response"]["GeoObjectCollection"]["featureMember"]

        if not members:
            raise YandexGeocoderAddressNotFoundException(f"Адрес не найден: {address}")

        pos = members[0]["GeoObject"]["Point"]["pos"]
        lon, lat = map(float, pos.split())
        return lon, lat


yandex_geo = YandexGeocoder(
    "https://geocode-maps.yandex.ru/v1/",
    settings.API_KEY
)
