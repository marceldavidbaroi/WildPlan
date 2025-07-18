import httpx
from fastapi import HTTPException

async def get_lat_lon(location: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": location, "format": "json", "limit": 1}
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        if not data:
            raise HTTPException(404, "Location not found")
        return float(data[0]["lat"]), float(data[0]["lon"])

async def get_weather(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": lat, "longitude": lon, "current_weather": True}
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        return data["current_weather"]
