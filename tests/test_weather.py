def test_weather_status_when_not_configured(client):
    response = client.get("/api/weather/status")

    assert response.status_code == 200
    assert response.json()["configured"] is False


def test_weather_requires_api_key(client):
    response = client.get("/api/weather", params={"city": "Johannesburg"})

    assert response.status_code == 503


def test_weather_requires_city_or_coordinates(client):
    response = client.get("/api/weather")

    assert response.status_code == 400


def test_weather_location_crud(client, auth_headers):
    created = client.post(
        "/api/weather/locations",
        headers=auth_headers,
        json={
            "name": "Johannesburg",
            "country": "ZA",
            "latitude": -26.2041,
            "longitude": 28.0473,
            "is_pinned": True,
        },
    )
    assert created.status_code == 201
    location_id = created.json()["id"]

    listed = client.get("/api/weather/locations", headers=auth_headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    duplicate = client.post(
        "/api/weather/locations",
        headers=auth_headers,
        json={"name": "Johannesburg", "country": "ZA"},
    )
    assert duplicate.status_code == 409

    updated = client.patch(
        f"/api/weather/locations/{location_id}",
        headers=auth_headers,
        json={"is_pinned": False},
    )
    assert updated.status_code == 200
    assert updated.json()["is_pinned"] is False

    deleted = client.delete(
        f"/api/weather/locations/{location_id}", headers=auth_headers
    )
    assert deleted.status_code == 204


def test_weather_locations_require_auth(client):
    assert client.get("/api/weather/locations").status_code == 401
    assert (
        client.post(
            "/api/weather/locations", json={"name": "Johannesburg"}
        ).status_code
        == 401
    )
