from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional, Any
import json
import logging

from app.db.session import get_db
from app.models.user import User
from app.models.account import Account
from app.models.email import Email
from app.services.calendar import fetch_today_events, add_calendar_event
from app.services.auth import get_active_account, get_current_user_from_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/calendar", tags=["Calendar"])

# Re-use the session-based auth pattern from emails
# Dependency is now imported from service.py

class AddEventRequest(BaseModel):
    title: str
    start_time: str # ISO format (e.g. 2026-03-19T10:00:00Z)
    end_time: str   # ISO format
    description: Optional[str] = None
    location: Optional[str] = None
    email_id: Optional[str] = None # Optional: to link with an email

@router.get("/today")
async def get_today_calendar(
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account)
):
    """
    Returns today's calendar events from Google Calendar.
    """
    try:
        events = await fetch_today_events(current_account, db)
        return events
    except Exception as e:
        logger.error(f"Router error fetching today's events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add")
async def add_to_calendar(
    data: AddEventRequest,
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account)
):
    """
    Adds a new event to the user's primary Google Calendar.
    """
    try:
        event = await add_calendar_event(
            account=current_account,
            db=db,
            title=data.title,
            start_time=data.start_time,
            end_time=data.end_time,
            description=data.description,
            location=data.location
        )
        
        # If email_id is provided, link the calendar event to the original email
        if data.email_id:
            stmt = select(Email).where(Email.id == data.email_id, Email.user_id == current_account.user_id)
            result = await db.execute(stmt)
            email_obj = result.scalar_one_or_none()
            
            if email_obj:
                email_obj.calendar_event_id = event.get('id')
                await db.commit()
                
        return {"status": "success", "event": event}
    except Exception as e:
        logger.error(f"Router error adding event: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add calendar event: {str(e)}")
