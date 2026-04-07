from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, AccountResponse
from app.services.auth import oauth, get_current_user_from_session
from app.models.account import Account
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/login")
async def login(request: Request, prompt: str | None = None):
    """
    Redirects the user to the Google OAuth login page.
    """
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    kwargs = {}
    if prompt:
        kwargs["prompt"] = prompt
    return await oauth.google.authorize_redirect(request, redirect_uri, **kwargs)


@router.get("/callback")
async def callback(request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """
    Handles the callback from Google after user signs in.
    """
    try:
        # Get the token from Google
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth failure: {str(e)}")
        
    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")
    picture_url = user_info.get("picture")
    
    # Store access tokens
    access_token = token.get("access_token")
    refresh_token = token.get("refresh_token")
    expires_at = token.get("expires_at")
    
    token_expiry = None
    if expires_at:
        token_expiry = datetime.fromtimestamp(expires_at, tz=timezone.utc)

    # Check if this Account already exists
    from app.models.account import Account
    stmt_acc = select(Account).where(Account.google_id == google_id)
    account = (await db.execute(stmt_acc)).scalar_one_or_none()
    
    current_user_id = request.session.get("user_id")
    
    if account:
        # Update existing account tokens
        account.access_token = access_token
        if refresh_token:
            account.refresh_token = refresh_token
        account.token_expiry = token_expiry
        user_id = account.user_id
        
        # Update primary user info (optional, just to keep sync)
        stmt_user = select(User).where(User.id == user_id)
        user = (await db.execute(stmt_user)).scalar_one_or_none()
        if user:
            user.last_login = datetime.now(timezone.utc)
    else:
        # New account being connected
        if current_user_id:
            user_id = current_user_id
        else:
            # Brand new user or existing user logging in with new sub-account
            stmt_user = select(User).where(User.email == email)
            user = (await db.execute(stmt_user)).scalar_one_or_none()
            if not user:
                user = User(
                    email=email,
                    name=name,
                    picture_url=picture_url,
                    google_id=google_id
                )
                db.add(user)
                await db.flush()
            user_id = user.id
            user.last_login = datetime.now(timezone.utc)

        # Check existing accounts to see if this should be primary
        stmt_count = select(Account).where(Account.user_id == user_id)
        existing_accs = (await db.execute(stmt_count)).scalars().all()
        
        account = Account(
            user_id=user_id,
            google_id=google_id,
            email=email,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expiry=token_expiry,
            is_primary=len(existing_accs) == 0
        )
        db.add(account)
    
    await db.commit()
    await db.refresh(account)
    
    from app.api.endpoints.emails import background_sync_emails
    background_tasks.add_task(background_sync_emails, account.id)
    
    # Set session
    request.session["user_id"] = user_id
    
    # Redirect to the frontend dashboard
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard")


@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Returns the currently authenticated user based on session.
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    from sqlalchemy.orm import selectinload
    stmt = select(User).options(selectinload(User.accounts)).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        request.session.pop("user_id", None)
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

@router.get("/accounts", response_model=list[AccountResponse])
async def list_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_from_session)
):
    """
    Returns all Google accounts connected to the user.
    """
    stmt = select(Account).where(Account.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/logout")
async def logout(request: Request):
    request.session.pop("user_id", None)
    return {"message": "Successfully logged out"}
