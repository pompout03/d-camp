from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# Router imports
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.emails import router as emails_router
from app.api.endpoints.chat import router as chatbot_router
from app.api.endpoints.waitlist import router as waitlist_router
from app.api.endpoints.calendar import router as calendar_router
from app.api.endpoints.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="Decamp Backend API",
    description="FastAPI backend for Decamp featuring Google OAuth and Gemini AI prioritization.",
    version="1.0.0",
    lifespan=lifespan,
)

# Set security flags based on environment
# We are local if APP_DOMAIN is localhost or if it's not set
is_local = settings.APP_DOMAIN == "localhost" or not settings.APP_DOMAIN

# Add Session Middleware for OAuth state and internal auth
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="decamp_session",
    max_age=14 * 24 * 60 * 60,  # 14 days
    # In production (cross-site), we MUST use same_site="none" and https_only=True
    same_site="lax" if is_local else "none",
    https_only=not is_local,
)

# Add CORS Middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*\.binbyte\.dev|http://localhost:3000|http://127.0.0.1:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization", "X-Account-Id", "X-Requested-With"],
    expose_headers=["Content-Type", "X-Account-Id"],
    max_age=600,
)

# Register routers
app.include_router(auth_router)
app.include_router(emails_router)  # This uses prefix="/api/inbox" from the router definition

# Backwards compatibility for old frontend code
from app.api.endpoints.emails import router as compat_emails_router
app.include_router(compat_emails_router, prefix="/api/emails")

app.include_router(chatbot_router)
app.include_router(waitlist_router)
app.include_router(calendar_router)
app.include_router(settings_router, prefix="/api")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
