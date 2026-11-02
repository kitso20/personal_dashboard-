from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Document, EmailLog, User
from app.schemas import (
    EmailLogResponse,
    EmailSendResponse,
    EmailStatusResponse,
    EmailTrigger,
)
from app.security import get_current_user
from app.services.email_service import (
    EmailNotConfiguredError,
    EmailSendError,
    email_service,
)

router = APIRouter(prefix="/api/emails", tags=["emails"])


def _compile_summary(
    payload: EmailTrigger, owner: User, db: Session
) -> str:
    if payload.message_body:
        return payload.message_body

    query = db.query(Document).filter(Document.owner_id == owner.id)
    if payload.document_ids:
        query = query.filter(Document.id.in_(payload.document_ids))
    documents = query.order_by(Document.updated_at.desc()).limit(10).all()

    intro = f"Progress summary for {owner.name or owner.email}"
    if not documents:
        return f"{intro}\n\nNo documents have been added yet."

    sections = [intro]
    for document in documents:
        sections.append(
            f"{document.title} [{document.status}]\n{document.content}"
        )
    return "\n\n".join(sections)


@router.get("/status", response_model=EmailStatusResponse)
def email_status():
    return EmailStatusResponse(
        configured=email_service.is_configured(), sender=settings.GMAIL_SENDER
    )


@router.get("/logs", response_model=list[EmailLogResponse])
def list_email_logs(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(EmailLog)
        .filter(EmailLog.owner_id == current_user.id)
        .order_by(EmailLog.timestamp.desc())
        .all()
    )


@router.post("/send-summary", response_model=EmailSendResponse)
def send_summary(
    payload: EmailTrigger,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    body = _compile_summary(payload, current_user, db)
    log = EmailLog(
        recipient=payload.recipient,
        subject=payload.subject,
        owner_id=current_user.id,
        status="pending",
    )
    db.add(log)
    db.flush()

    try:
        message_id = email_service.send_summary(
            recipient=payload.recipient,
            subject=payload.subject,
            body_text=body,
        )
    except EmailNotConfiguredError as exc:
        log.status = "failed"
        log.detail = str(exc)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except EmailSendError as exc:
        log.status = "failed"
        log.detail = str(exc)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        ) from exc

    log.status = "sent"
    log.detail = message_id
    db.commit()
    db.refresh(log)
    return EmailSendResponse(status="sent", message_id=message_id, log=log)
