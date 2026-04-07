from pydantic import BaseModel
from typing import List, Optional

class SettingsBase(BaseModel):
    high_priority_alerts: bool = True
    daily_summary_email: bool = False
    trusted_senders: List[str] = []
    key_phrases: List[str] = []

class SettingsUpdate(BaseModel):
    high_priority_alerts: Optional[bool] = None
    daily_summary_email: Optional[bool] = None
    trusted_senders: Optional[List[str]] = None
    key_phrases: Optional[List[str]] = None

class SettingsResponse(SettingsBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True
