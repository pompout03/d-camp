from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import logging

from app.models.account import Account
from app.core.config import settings

logger = logging.getLogger(__name__)

from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth import refresh_account_token

async def get_calendar_service(account: Account, db: AsyncSession):
    """
    Constructs a Google Calendar API service instance from the account's stored OAuth credentials,
    after ensuring the token is refreshed and persisted.
    """
    creds = await refresh_account_token(account, db)
    return build('calendar', 'v3', credentials=creds)

async def fetch_today_events(account: Account, db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Fetch all calendar events for the current day for the connected user.
    """
    try:
        service = await get_calendar_service(account, db)
        
        # Define the time range for "today" (local time of the server, usually UTC)
        now = datetime.now(timezone.utc)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        time_min = start_of_day.isoformat()
        time_max = end_of_day.isoformat()
        
        # Run synchronous call in a thread
        events_result = await asyncio.to_thread(
            service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy='startTime'
            ).execute
        )
        
        events = events_result.get('items', [])
        return events
    except Exception as e:
        logger.error(f"Error fetching today's events: {e}")
        return []

async def add_calendar_event(
    account: Account, 
    db: AsyncSession,
    title: str, 
    start_time: str, 
    end_time: str, 
    description: Optional[str] = None,
    location: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates a new event in the account's primary Google Calendar.
    """
    try:
        service = await get_calendar_service(account, db)
        
        event = {
            'summary': title,
            'location': location,
            'description': description,
            'start': {
                'dateTime': start_time,
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time,
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': True,
            },
        }
        
        # Run synchronous call in a thread
        created_event = await asyncio.to_thread(
            service.events().insert(calendarId='primary', body=event).execute
        )
        return created_event
    except Exception as e:
        logger.error(f"Error adding calendar event: {e}")
        raise e
