import os
from dotenv import load_dotenv

load_dotenv()


def _as_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self):
        self.PROJECT_NAME = "Personal Dashboard API"
        self.VERSION = "1.0.0"

        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
        self.REDIRECT_URI = os.getenv("REDIRECT_URI")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", self.SECRET_KEY)
        self.JWT_ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/dashboard.sqlite3")

        self.OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
        self.OPENWEATHER_BASE_URL = os.getenv(
            "OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5"
        )

        self.GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json")
        self.GOOGLE_TOKEN_PATH = os.getenv("GOOGLE_TOKEN_PATH", "token.json")
        self.GMAIL_SENDER = os.getenv("GMAIL_SENDER")
        self.GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

        self.CORS_ORIGINS = _as_list(
            os.getenv(
                "CORS_ORIGINS",
                "http://localhost:3000,http://localhost:5173,http://localhost:8000",
            )
        )

        self.AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/auth"
        self.TOKEN_URL = "https://oauth2.googleapis.com/token"
        self.USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

        self.SCOPES = [
            "openid",
            "email",
            "profile",
        ]


settings = Settings()
