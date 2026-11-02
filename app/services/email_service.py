import base64
from email.message import EmailMessage
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.config import settings


class EmailNotConfiguredError(Exception):
    pass


class EmailSendError(Exception):
    pass


class GmailEmailService:
    def __init__(self) -> None:
        self.token_path = Path(settings.GOOGLE_TOKEN_PATH)
        self.scopes = settings.GMAIL_SCOPES

    def is_configured(self) -> bool:
        return self.token_path.exists()

    def _load_credentials(self) -> Credentials:
        if not self.token_path.exists():
            raise EmailNotConfiguredError(
                "Gmail is not configured. Add a valid OAuth token to "
                f"'{self.token_path}' after enabling the Gmail API."
            )

        credentials = Credentials.from_authorized_user_file(
            str(self.token_path), self.scopes
        )

        if credentials.valid:
            return credentials

        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            self.token_path.write_text(credentials.to_json(), encoding="utf-8")
            return credentials

        raise EmailNotConfiguredError(
            "Gmail credentials are invalid or expired. Re-authorize the Google account."
        )

    def send_summary(
        self,
        recipient: str,
        subject: str,
        body_text: str,
        html_body: str | None = None,
    ) -> str:
        credentials = self._load_credentials()
        message = EmailMessage()
        message["To"] = recipient
        message["Subject"] = subject
        if settings.GMAIL_SENDER:
            message["From"] = settings.GMAIL_SENDER
        message.set_content(body_text)
        if html_body:
            message.add_alternative(html_body, subtype="html")

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

        try:
            service = build("gmail", "v1", credentials=credentials)
            sent = (
                service.users()
                .messages()
                .send(userId="me", body={"raw": encoded_message})
                .execute()
            )
        except HttpError as exc:
            raise EmailSendError(f"Gmail API request failed: {exc}") from exc

        message_id = sent.get("id")
        if not message_id:
            raise EmailSendError("Gmail API did not return a message id")
        return message_id


email_service = GmailEmailService()
