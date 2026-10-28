from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from app.routes import auth, dashboard
from app.config import settings

app = FastAPI(
    title="Personal Dashboard",
    description="A custom Personal Dashboard application with Google OAuth authentication",
    version="1.0.0"
)

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    user = request.session.get('user')
    if user:
        return templates.TemplateResponse(request, "index.html", {"user": user, "logged_in": True})
    return templates.TemplateResponse(request, "index.html", {"user": None, "logged_in": False})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
