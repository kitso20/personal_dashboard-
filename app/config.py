import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
        self.REDIRECT_URI = os.getenv("REDIRECT_URI")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
        
        # Google OAuth endpoints
        self.AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/auth"
        self.TOKEN_URL = "https://oauth2.googleapis.com/token"
        self.USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
        
        # Scopes
        self.SCOPES = [
            "openid",
            "email",
            "profile"
        ]

settings = Settings()
