from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar"
    }
)

from fastapi import Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.user import User
from app.models.account import Account

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from datetime import datetime, timezone

async def get_current_user_from_session(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_active_account(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_from_session)
) -> Account:
    # 1. Fetch all accounts for this user
    stmt_all = select(Account).where(Account.user_id == current_user.id)
    all_accounts = (await db.execute(stmt_all)).scalars().all()
    
    if not all_accounts:
        raise HTTPException(status_code=401, detail="No connected accounts found")

    account = None
    account_id = request.headers.get("X-Account-Id")
    
    if account_id:
        account = next((a for a in all_accounts if a.id == account_id), None)
            
    # Fallback to primary account
    if not account:
        account = next((a for a in all_accounts if a.is_primary), None)
    
    # Fallback to any account if no primary set
    if not account:
        account = all_accounts[0]

    # 2. Validate token presence
    if not account.access_token:
        raise HTTPException(status_code=400, detail="Account is missing access token")
        
    return account

async def refresh_account_token(account: Account, db: AsyncSession) -> Credentials:
    """
    Checks if the account token is expired, refreshes it if needed, 
    and persists the new token to the database.
    """
    creds = Credentials(
        token=account.access_token,
        refresh_token=account.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    )

    # Check if needs refresh
    if not creds.valid or (creds.expiry and creds.expiry < datetime.now(timezone.utc)):
        if not creds.refresh_token:
            raise HTTPException(status_code=401, detail="No refresh token available. Please log in again.")
        
        try:
            # Refresh the token (non-blocking)
            import asyncio
            await asyncio.to_thread(creds.refresh, GoogleRequest())
            
            # Persist back to DB
            account.access_token = creds.token
            if creds.expiry:
                account.token_expiry = creds.expiry.replace(tzinfo=timezone.utc)
            
            await db.commit()
            await db.refresh(account)
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Failed to refresh Google token: {str(e)}")
            
    return creds
