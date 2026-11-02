def test_document_crud(client, auth_headers):
    created = client.post(
        "/api/documents",
        headers=auth_headers,
        json={
            "title": "Architecture Notes",
            "content": "Backend uses FastAPI and SQLAlchemy.",
            "status": "In Progress",
        },
    )
    assert created.status_code == 201
    document_id = created.json()["id"]
    assert created.json()["title"] == "Architecture Notes"

    listed = client.get("/api/documents", headers=auth_headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = client.get(f"/api/documents/{document_id}", headers=auth_headers)
    assert fetched.status_code == 200

    updated = client.patch(
        f"/api/documents/{document_id}",
        headers=auth_headers,
        json={"status": "Completed"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "Completed"

    deleted = client.delete(f"/api/documents/{document_id}", headers=auth_headers)
    assert deleted.status_code == 204
    assert client.get("/api/documents", headers=auth_headers).json() == []


def test_documents_require_auth(client):
    assert client.get("/api/documents").status_code == 401
    assert (
        client.post(
            "/api/documents", json={"title": "Title", "content": "Body"}
        ).status_code
        == 401
    )


def test_user_cannot_access_another_users_document(client, auth_headers):
    created = client.post(
        "/api/documents",
        headers=auth_headers,
        json={"title": "Private", "content": "Only mine"},
    )
    document_id = created.json()["id"]

    client.post(
        "/api/auth/register",
        json={"email": "other@example.com", "password": "password123"},
    )
    token = client.post(
        "/api/auth/token",
        data={"username": "other@example.com", "password": "password123"},
    ).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/documents/{document_id}", headers=other_headers)
    assert response.status_code == 404
