import uuid
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime

from app.db.base import Base

class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    emails_per_day: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    user_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notify: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
