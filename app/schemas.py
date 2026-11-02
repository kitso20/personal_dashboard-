from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, max_length=120)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str | None = None
    picture: str | None = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    status: str = Field(default="In Progress", max_length=40)


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, max_length=40)


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    status: str
    created_at: datetime
    updated_at: datetime


class EmailTrigger(BaseModel):
    recipient: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message_body: str | None = None
    document_ids: list[int] = Field(default_factory=list)


class EmailLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recipient: EmailStr
    subject: str
    status: str
    detail: str | None = None
    timestamp: datetime


class EmailSendResponse(BaseModel):
    status: str
    message_id: str | None = None
    log: EmailLogResponse


class EmailStatusResponse(BaseModel):
    configured: bool
    sender: str | None = None


class WeatherLocationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    country: str | None = Field(default=None, max_length=80)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    is_pinned: bool = False


class WeatherLocationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    country: str | None = Field(default=None, max_length=80)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    is_pinned: bool | None = None


class WeatherLocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_pinned: bool
    created_at: datetime


class WeatherStatusResponse(BaseModel):
    configured: bool


class WeatherForecastDay(BaseModel):
    date: str
    temp_min: float
    temp_max: float
    condition: str
    description: str
    icon: str | None = None


class WeatherBundle(BaseModel):
    city: str
    country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    temp: float
    feels_like: float
    condition: str
    description: str
    icon: str | None = None
    humidity: int
    pressure: int
    wind_speed: float
    visibility: int | None = None
    units: str
    forecast: list[WeatherForecastDay] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
