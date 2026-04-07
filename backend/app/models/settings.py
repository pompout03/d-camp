import uuid
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.db.base import Base

class UserSetting(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    # Notification preferences
    high_priority_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    daily_summary_email: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Priority rules (PostgreSQL ARRAY type)
    trusted_senders: Mapped[List[str]] = mapped_column(ARRAY(String), default=[])
    key_phrases: Mapped[List[str]] = mapped_column(ARRAY(String), default=[])
