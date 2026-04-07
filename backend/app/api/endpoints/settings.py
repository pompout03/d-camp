from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.settings import UserSetting
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.auth import get_current_user_from_session
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_from_session)
):
    """
    Fetch the current user's settings.
    Creates default settings if none exist.
    """
    stmt = select(UserSetting).where(UserSetting.user_id == current_user.id)
    result = await db.execute(stmt)
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = UserSetting(user_id=current_user.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings

@router.put("", response_model=SettingsResponse)
async def update_settings(
    settings_in: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_from_session)
):
    """
    Update the current user's settings.
    """
    stmt = select(UserSetting).where(UserSetting.user_id == current_user.id)
    result = await db.execute(stmt)
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = UserSetting(user_id=current_user.id)
        db.add(settings)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await db.commit()
    await db.refresh(settings)
    return settings
