from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

import app.models
from app.config import settings
from app.database import Base, engine
from app.routes import api_auth, auth, dashboard
from app.schemas import HealthResponse


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Personal dashboard API with authentication, documents, weather, and email summaries",
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

app.include_router(api_auth.router)
app.include_router(auth.router)
app.include_router(dashboard.router)


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def health():
    return HealthResponse(
        status="ok", service=settings.PROJECT_NAME, version=settings.VERSION
    )


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    user = request.session.get("user")
    if user:
        return templates.TemplateResponse(
            request, "index.html", {"user": user, "logged_in": True}
        )
    return templates.TemplateResponse(
        request, "index.html", {"user": None, "logged_in": False}
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
