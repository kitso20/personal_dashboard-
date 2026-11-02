def test_register_and_login(client):
    register = client.post(
        "/api/auth/register",
        json={
            "email": "Person@Example.com",
            "password": "password123",
            "name": "Person",
        },
    )
    assert register.status_code == 201
    assert register.json()["email"] == "person@example.com"
    assert register.json()["name"] == "Person"

    token = client.post(
        "/api/auth/token",
        data={"username": "person@example.com", "password": "password123"},
    )
    assert token.status_code == 200
    assert token.json()["token_type"] == "bearer"
    assert token.json()["access_token"]

    me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token.json()['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "person@example.com"


def test_duplicate_registration_is_rejected(client):
    payload = {"email": "dupe@example.com", "password": "password123"}
    assert client.post("/api/auth/register", json=payload).status_code == 201

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_invalid_login_is_rejected(client):
    client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "password": "password123"},
    )

    response = client.post(
        "/api/auth/token",
        data={"username": "login@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 400


def test_current_user_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert (
        client.get(
            "/api/auth/me", headers={"Authorization": "Bearer invalid-token"}
        ).status_code
        == 401
    )
