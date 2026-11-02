from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, User
from app.schemas import DocumentCreate, DocumentResponse, DocumentUpdate
from app.security import get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _get_owned_document(
    document_id: int, owner_id: int, db: Session
) -> Document:
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.owner_id == owner_id)
        .first()
    )
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )
    return document


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(Document)
        .filter(Document.owner_id == current_user.id)
        .order_by(Document.updated_at.desc())
        .all()
    )


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    payload: DocumentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    document = Document(
        title=payload.title,
        content=payload.content,
        status=payload.status,
        owner_id=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _get_owned_document(document_id, current_user.id, db)


@router.patch("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    document = _get_owned_document(document_id, current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(document, field, value)
    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    document = _get_owned_document(document_id, current_user.id, db)
    db.delete(document)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
