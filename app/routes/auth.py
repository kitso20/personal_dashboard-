from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from starlette.middleware.sessions import SessionMiddleware
from app.auth import oauth_handler
from app.config import settings

router = APIRouter()

@router.get("/login")
async def login(request: Request):
    auth_url, state = oauth_handler.get_authorization_url()
    request.session['oauth_state'] = state
    return RedirectResponse(url=auth_url)

@router.get("/auth/callback")
async def auth_callback(request: Request, code: str = None, state: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    # Verify state (optional but recommended)
    session_state = request.session.get('oauth_state')
    if session_state and state != session_state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    try:
        # Exchange code for tokens
        tokens = await oauth_handler.get_tokens(code)
        access_token = tokens.get('access_token')
        
        # Get user info
        user_info = await oauth_handler.get_user_info(access_token)
        
        # Store user in session
        request.session['user'] = {
            'id': user_info.get('id'),
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'picture': user_info.get('picture')
        }
        request.session['access_token'] = access_token
        
        # Remove state from session
        request.session.pop('oauth_state', None)
        
        return RedirectResponse(url="/dashboard")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/")
