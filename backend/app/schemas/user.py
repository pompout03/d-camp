from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    picture_url: Optional[str] = None

class AccountResponse(BaseModel):
    id: str
    email: str
    provider: str
    is_primary: bool
    is_active: bool
    created_at: datetime
    last_sync: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    picture_url: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    last_login: Optional[datetime] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: datetime
    accounts: list[AccountResponse] = []

    class Config:
        from_attributes = True
