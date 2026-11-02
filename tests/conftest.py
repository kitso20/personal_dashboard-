import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DIR = Path(tempfile.mkdtemp(prefix="dashboard-tests-"))

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DIR / 'test.sqlite3'}"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret"
os.environ["OPENWEATHER_API_KEY"] = ""
os.environ["GOOGLE_TOKEN_PATH"] = str(TEST_DIR / "token.json")
os.environ["GOOGLE_CREDENTIALS_PATH"] = str(TEST_DIR / "credentials.json")
os.environ["GMAIL_SENDER"] = ""

from app.database import Base, engine
from app.main import app


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def auth_headers(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "password": "password123",
            "name": "Test User",
        },
    )
    assert response.status_code == 201

    token_response = client.post(
        "/api/auth/token",
        data={"username": "user@example.com", "password": "password123"},
    )
    assert token_response.status_code == 200
    token = token_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
