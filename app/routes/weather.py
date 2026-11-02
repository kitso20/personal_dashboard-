from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, WeatherLocation
from app.schemas import (
    WeatherBundle,
    WeatherLocationCreate,
    WeatherLocationResponse,
    WeatherLocationUpdate,
    WeatherStatusResponse,
)
from app.security import get_current_user
from app.services.weather_service import (
    WeatherAPIError,
    WeatherNotConfiguredError,
    weather_service,
)

router = APIRouter(prefix="/api/weather", tags=["weather"])

Units = Literal["metric", "imperial", "standard"]


def _get_owned_location(
    location_id: int, owner_id: int, db: Session
) -> WeatherLocation:
    location = (
        db.query(WeatherLocation)
        .filter(
            WeatherLocation.id == location_id,
            WeatherLocation.owner_id == owner_id,
        )
        .first()
    )
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Weather location not found"
        )
    return location


def _fetch_error(exc: Exception) -> HTTPException:
    if isinstance(exc, WeatherNotConfiguredError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        )
    if isinstance(exc, ValueError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
    return HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))


@router.get("/status", response_model=WeatherStatusResponse)
def weather_status():
    return WeatherStatusResponse(configured=weather_service.is_configured())


@router.get("", response_model=WeatherBundle)
async def get_weather(
    city: Annotated[str | None, Query(min_length=1)] = None,
    latitude: Annotated[float | None, Query(ge=-90, le=90)] = None,
    longitude: Annotated[float | None, Query(ge=-180, le=180)] = None,
    units: Units = "metric",
):
    if not city and (latitude is None or longitude is None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a city name or both latitude and longitude",
        )
    try:
        return await weather_service.get_bundle(
            city=city, latitude=latitude, longitude=longitude, units=units
        )
    except (WeatherNotConfiguredError, WeatherAPIError, ValueError) as exc:
        raise _fetch_error(exc) from exc


@router.get("/locations", response_model=list[WeatherLocationResponse])
def list_locations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(WeatherLocation)
        .filter(WeatherLocation.owner_id == current_user.id)
        .order_by(WeatherLocation.is_pinned.desc(), WeatherLocation.created_at)
        .all()
    )


@router.post(
    "/locations",
    response_model=WeatherLocationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_location(
    payload: WeatherLocationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    location = WeatherLocation(owner_id=current_user.id, **payload.model_dump())
    db.add(location)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That weather location is already saved",
        ) from exc
    db.refresh(location)
    return location


@router.patch("/locations/{location_id}", response_model=WeatherLocationResponse)
def update_location(
    location_id: int,
    payload: WeatherLocationUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    location = _get_owned_location(location_id, current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(location, field, value)
    db.commit()
    db.refresh(location)
    return location


@router.delete(
    "/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_location(
    location_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    location = _get_owned_location(location_id, current_user.id, db)
    db.delete(location)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/locations/{location_id}/forecast", response_model=WeatherBundle)
async def get_location_weather(
    location_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    units: Units = "metric",
):
    location = _get_owned_location(location_id, current_user.id, db)
    city = location.name
    if location.country:
        city = f"{location.name},{location.country}"

    try:
        return await weather_service.get_bundle(
            city=city,
            latitude=location.latitude,
            longitude=location.longitude,
            units=units,
        )
    except (WeatherNotConfiguredError, WeatherAPIError, ValueError) as exc:
        raise _fetch_error(exc) from exc
