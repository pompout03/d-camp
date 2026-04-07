from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import all models here for Alembic/metadata awareness
from app.models.user import User
from app.models.account import Account
from app.models.email import Email
from app.models.chat import ChatMessage
from app.models.waitlist import WaitlistEntry
from app.models.settings import UserSetting
