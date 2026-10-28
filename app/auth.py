import secrets
from urllib.parse import urlencode
import httpx
from fastapi import HTTPException, Request
from starlette.responses import RedirectResponse
from app.config import settings

class OAuthHandler:
    def __init__(self):
        self.authorization_url = settings.AUTHORIZATION_URL
        self.token_url = settings.TOKEN_URL
        self.userinfo_url = settings.USERINFO_URL
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.REDIRECT_URI
        self.scopes = settings.SCOPES
    
    def get_authorization_url(self, state: str = None):
        if not state:
            state = secrets.token_urlsafe(32)
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(self.scopes),
            'response_type': 'code',
            'access_type': 'offline',
            'state': state,
            'prompt': 'consent'
        }
        
        auth_url = f"{self.authorization_url}?{urlencode(params)}"
        return auth_url, state
    
    async def get_tokens(self, code: str):
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.token_url, data=data)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
            return response.json()
    
    async def get_user_info(self, access_token: str):
        headers = {'Authorization': f'Bearer {access_token}'}
        async with httpx.AsyncClient() as client:
            response = await client.get(self.userinfo_url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            return response.json()

oauth_handler = OAuthHandler()
