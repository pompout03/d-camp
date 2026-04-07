import uuid
from typing import Optional, List
from datetime import datetime, timezone

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, Text, Boolean, Integer, ForeignKey
from app.db.base import Base

class Email(Base):
    __tablename__ = "emails"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    gmail_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    thread_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sender: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sender_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    subject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # plain text
    body_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # exact html as appeared in gmail
    received_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # AI fields and others, leaving nullable for now
    priority: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    urgency_tier: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    needs_response: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_items: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # json
    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    deadline_detected: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meeting_detected: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    meeting_title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meeting_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meeting_time: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meeting_duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    meeting_location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    form_detected: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    form_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    waiting_on: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    calendar_event_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
