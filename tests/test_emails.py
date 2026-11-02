from app.services.email_service import email_service


def test_email_status_when_not_configured(client):
    response = client.get("/api/emails/status")

    assert response.status_code == 200
    assert response.json()["configured"] is False


def test_send_summary_logs_failure_when_not_configured(client, auth_headers):
    response = client.post(
        "/api/emails/send-summary",
        headers=auth_headers,
        json={"recipient": "user@example.com", "subject": "Weekly summary"},
    )

    assert response.status_code == 503

    logs = client.get("/api/emails/logs", headers=auth_headers)
    assert logs.status_code == 200
    assert len(logs.json()) == 1
    assert logs.json()[0]["status"] == "failed"


def test_send_summary_logs_success(client, auth_headers, monkeypatch):
    def fake_send_summary(recipient, subject, body_text, html_body=None):
        assert recipient == "user@example.com"
        assert subject == "Weekly summary"
        assert "Progress summary" in body_text
        return "message-123"

    monkeypatch.setattr(email_service, "send_summary", fake_send_summary)

    response = client.post(
        "/api/emails/send-summary",
        headers=auth_headers,
        json={"recipient": "user@example.com", "subject": "Weekly summary"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "sent"
    assert response.json()["message_id"] == "message-123"

    logs = client.get("/api/emails/logs", headers=auth_headers)
    assert logs.json()[0]["status"] == "sent"
    assert logs.json()[0]["detail"] == "message-123"


def test_email_logs_require_auth(client):
    assert client.get("/api/emails/logs").status_code == 401
