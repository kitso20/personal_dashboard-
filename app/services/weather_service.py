from collections import defaultdict

import httpx

from app.config import settings
from app.schemas import WeatherBundle, WeatherForecastDay


class WeatherNotConfiguredError(Exception):
    pass


class WeatherAPIError(Exception):
    pass


class OpenWeatherService:
    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        self.api_key = api_key if api_key is not None else settings.OPENWEATHER_API_KEY
        self.base_url = (base_url or settings.OPENWEATHER_BASE_URL).rstrip("/")

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _build_params(
        self,
        units: str,
        city: str | None,
        latitude: float | None,
        longitude: float | None,
    ) -> dict[str, str | float]:
        if not self.is_configured():
            raise WeatherNotConfiguredError(
                "OpenWeather is not configured. Set OPENWEATHER_API_KEY in the environment."
            )

        params: dict[str, str | float] = {"appid": self.api_key, "units": units}
        if city:
            params["q"] = city
        elif latitude is not None and longitude is not None:
            params["lat"] = latitude
            params["lon"] = longitude
        else:
            raise ValueError("Provide a city name or both latitude and longitude")
        return params

    async def _request(self, path: str, params: dict) -> dict:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/{path}", params=params)
        except httpx.HTTPError as exc:
            raise WeatherAPIError(f"Could not reach OpenWeather: {exc}") from exc

        if response.status_code == 401:
            raise WeatherAPIError("OpenWeather rejected the configured API key")
        if response.status_code == 404:
            raise WeatherAPIError("Weather location was not found")
        if response.status_code >= 400:
            raise WeatherAPIError(
                f"OpenWeather request failed with status {response.status_code}"
            )
        return response.json()

    async def get_current(
        self,
        *,
        city: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        units: str = "metric",
    ) -> dict:
        params = self._build_params(units, city, latitude, longitude)
        return await self._request("weather", params)

    async def get_forecast(
        self,
        *,
        city: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        units: str = "metric",
    ) -> dict:
        params = self._build_params(units, city, latitude, longitude)
        return await self._request("forecast", params)

    @staticmethod
    def _daily_forecast(forecast: dict) -> list[WeatherForecastDay]:
        grouped: dict[str, list[dict]] = defaultdict(list)
        for item in forecast.get("list", []):
            day = item.get("dt_txt", "").split(" ")[0]
            if day:
                grouped[day].append(item)

        days: list[WeatherForecastDay] = []
        for day in sorted(grouped)[:5]:
            entries = grouped[day]
            temps_min = [entry["main"]["temp_min"] for entry in entries]
            temps_max = [entry["main"]["temp_max"] for entry in entries]
            weather = entries[len(entries) // 2].get("weather", [{}])[0]
            days.append(
                WeatherForecastDay(
                    date=day,
                    temp_min=round(min(temps_min), 1),
                    temp_max=round(max(temps_max), 1),
                    condition=weather.get("main", "Unknown"),
                    description=weather.get("description", ""),
                    icon=weather.get("icon"),
                )
            )
        return days

    async def get_bundle(
        self,
        *,
        city: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        units: str = "metric",
    ) -> WeatherBundle:
        current = await self.get_current(
            city=city, latitude=latitude, longitude=longitude, units=units
        )
        forecast = await self.get_forecast(
            city=city, latitude=latitude, longitude=longitude, units=units
        )

        weather = current.get("weather", [{}])[0]
        coordinates = current.get("coord", {})
        return WeatherBundle(
            city=current.get("name", city or ""),
            country=current.get("sys", {}).get("country"),
            latitude=coordinates.get("lat", latitude),
            longitude=coordinates.get("lon", longitude),
            temp=round(current["main"]["temp"], 1),
            feels_like=round(current["main"]["feels_like"], 1),
            condition=weather.get("main", "Unknown"),
            description=weather.get("description", ""),
            icon=weather.get("icon"),
            humidity=current["main"]["humidity"],
            pressure=current["main"]["pressure"],
            wind_speed=current.get("wind", {}).get("speed", 0.0),
            visibility=current.get("visibility"),
            units=units,
            forecast=self._daily_forecast(forecast),
        )


weather_service = OpenWeatherService()
