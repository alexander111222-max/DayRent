import httpx

from src.config import settings


class YandexGeocoder:
    def __init__(self,url: str, api_key: str):
        self._url = url
        self._api_key = api_key


    async def get_coordinates(self, address: str):
        params = {
            "apikey": self._api_key,
            "geocode": address,
            "format": "json"
        }
        async with httpx.AsyncClient() as client:
            resp = await client.get(url=self._url, params=params)
        data = resp.json()
        pos = data["response"]["GeoObjectCollection"]["featureMember"][0]["GeoObject"]["Point"]["pos"]
        lon, lat = map(float, pos.split())


        return [lon, lat]


yandex_geo = YandexGeocoder(
    "https://geocode-maps.yandex.ru/v1/",
    settings.API_KEY
)
