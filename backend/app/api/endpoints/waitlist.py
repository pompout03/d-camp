from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.db.session import get_db
from app.models.waitlist import WaitlistEntry

router = APIRouter(prefix="/api/waitlist", tags=["Waitlist"])

class WaitlistCreate(BaseModel):
    email: EmailStr
    feedback: Optional[str] = None
    emails_per_day: Optional[str] = None
    user_type: Optional[str] = None
    notify: bool = True

@router.post("/", status_code=status.HTTP_201_CREATED)
async def join_waitlist(entry: WaitlistCreate, db: AsyncSession = Depends(get_db)):
    """
    Join the waitlist.
    """
    # Check if email already exists
    stmt = select(WaitlistEntry).where(WaitlistEntry.email == entry.email)
    result = await db.execute(stmt)
    existing_entry = result.scalar_one_or_none()

    if existing_entry:
        return {"message": "You're already on the list!", "status": "duplicate"}

    new_entry = WaitlistEntry(
        email=entry.email,
        feedback=entry.feedback,
        emails_per_day=entry.emails_per_day,
        user_type=entry.user_type,
        notify=entry.notify
    )
    db.add(new_entry)
    await db.commit()
    
    return {"message": "You're on the list! We'll be in touch.", "status": "success"}

@router.get("/")
async def get_waitlist(db: AsyncSession = Depends(get_db)):
    """
    Admin tracking endpoint to view all waitlist entries.
    """
    stmt = select(WaitlistEntry).order_by(WaitlistEntry.created_at.desc())
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    return [
        {
            "id": e.id,
            "email": e.email,
            "feedback": e.feedback,
            "emails_per_day": e.emails_per_day,
            "user_type": e.user_type,
            "notify": e.notify,
            "created_at": e.created_at
        }
        for e in entries
    ]

class WaitlistUpdate(BaseModel):
    email: Optional[EmailStr] = None
    feedback: Optional[str] = None
    emails_per_day: Optional[str] = None
    user_type: Optional[str] = None
    notify: Optional[bool] = None

@router.patch("/{entry_id}")
async def update_waitlist_entry(
    entry_id: str, 
    update_data: WaitlistUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update a waitlist entry.
    """
    stmt = select(WaitlistEntry).where(WaitlistEntry.id == entry_id)
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    obj_data = update_data.dict(exclude_unset=True)
    for key, value in obj_data.items():
        setattr(entry, key, value)

    await db.commit()
    await db.refresh(entry)
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_waitlist_entry(
    entry_id: str, 
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a waitlist entry.
    """
    stmt = select(WaitlistEntry).where(WaitlistEntry.id == entry_id)
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    await db.delete(entry)
    await db.commit()
    return None
