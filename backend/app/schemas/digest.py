from pydantic import BaseModel
from typing import List, Optional

class SenderVolume(BaseModel):
    name: str
    email: str
    count: int

class WeeklyDigestResponse(BaseModel):
    total_analyzed: int
    high_priority_count: int
    needs_response_count: int
    meetings_count: int
    top_senders: List[SenderVolume]
    productivity_score: int
    insight_text: str
