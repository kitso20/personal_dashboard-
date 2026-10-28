from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="templates")

def get_current_user(request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse(request, "dashboard.html", {"user": user})
