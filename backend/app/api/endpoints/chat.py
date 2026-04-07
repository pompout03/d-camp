from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import json

from app.db.session import get_db
from app.models.user import User
from app.models.account import Account
from app.models.email import Email
from app.models.chat import ChatMessage
from app.ai.service import get_chat_response, stream_chat_response
from app.services.calendar import fetch_today_events
from app.services.auth import get_active_account, get_current_user_from_session

from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

# Dependency is now imported from service.py

@router.post("")
async def chat(
    request: Request, 
    data: dict, 
    db: AsyncSession = Depends(get_db), 
    current_account: Account = Depends(get_active_account)
):
    # Fetch user for name and other info
    stmt_user = select(User).where(User.id == current_account.user_id)
    user = (await db.execute(stmt_user)).scalar_one()
    user_message = data.get("message")
    session_id = data.get("session_id", "default")
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        user_msg_obj = ChatMessage(
            user_id=user.id,
            session_id=session_id,
            role="user",
            content=user_message
        )
        db.add(user_msg_obj)
        
        stmt = select(ChatMessage).where(
            ChatMessage.session_id == session_id,
            ChatMessage.user_id == current_account.user_id
        ).order_by(ChatMessage.created_at.desc()).limit(11)
        
        result = await db.execute(stmt)
        history_objs = result.scalars().all()
        history_objs = sorted(history_objs, key=lambda x: x.created_at)
        
        messages = [{"role": h.role, "content": h.content} for h in history_objs]
        
        # Get context (Emails & Calendar) for THIS user
        stmt = select(Email).where(Email.user_id == current_account.user_id).order_by(Email.synced_at.desc()).limit(10)
        result = await db.execute(stmt)
        emails = result.scalars().all()
        
        email_summary = ""
        for e in emails:
            email_summary += f"- FROM: {e.sender} | SUBJECT: {e.subject} | SUMMARY: {e.summary or 'No summary yet'}\n"
        
        if not email_summary:
            email_summary = "No emails found in the database yet."

        ai_reply = await get_chat_response(
            user_name=user.name,
            messages=messages,
            email_context=email_summary
        )

        ai_msg_obj = ChatMessage(
            user_id=current_account.user_id,
            session_id=session_id,
            role="assistant",
            content=ai_reply
        )
        db.add(ai_msg_obj)
        await db.commit()

        return {"reply": ai_reply, "session_id": session_id}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@router.post("/stream")
async def chat_stream(
    request: Request, 
    data: dict, 
    db: AsyncSession = Depends(get_db), 
    current_account: Account = Depends(get_active_account)
):
    # Fetch user for name
    stmt_user = select(User).where(User.id == current_account.user_id)
    user = (await db.execute(stmt_user)).scalar_one()
    
    user_message = data.get("message")
    session_id = data.get("session_id", "default")
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        # Save user message immediately
        user_msg_obj = ChatMessage(
            user_id=current_account.user_id,
            session_id=session_id,
            role="user",
            content=user_message
        )
        db.add(user_msg_obj)
        await db.commit() # Commit user message first
        
        # Get context (Emails & Calendar)
        # 1. Categorized Emails
        stmt_urgent = select(Email).where(Email.user_id == current_account.user_id, Email.urgency_tier == "Immediate Attention").limit(5)
        stmt_high = select(Email).where(Email.user_id == current_account.user_id, Email.priority == "high").order_by(Email.synced_at.desc()).limit(5)
        
        urgent_emails = (await db.execute(stmt_urgent)).scalars().all()
        high_emails = (await db.execute(stmt_high)).scalars().all()
        
        email_ctx = "--- TOP URGENT (Action Needed) ---\n"
        for e in urgent_emails:
            email_ctx += f"- {e.sender}: {e.subject} (Summary: {e.summary})\n"
        
        email_ctx += "\n--- HIGH PRIORITY ---\n"
        for e in high_emails:
            email_ctx += f"- {e.sender}: {e.subject} (Summary: {e.summary})\n"

        # 2. Calendar Context
        calendar_ctx = "--- TODAY'S CALENDAR ---\n"
        try:
            events = await fetch_today_events(current_account, db)
            if events:
                for ev in events:
                    start = ev['start'].get('dateTime') or ev['start'].get('date', 'All Day')
                    calendar_ctx += f"- {ev['summary']} @ {start} ({ev.get('location', 'No location')})\n"
            else:
                calendar_ctx += "No meetings scheduled for today."
        except Exception as ce:
            calendar_ctx += f"Could not sync calendar: {str(ce)}"

        # Get Chat History for THIS account
        stmt = select(ChatMessage).where(
            ChatMessage.session_id == session_id,
            ChatMessage.user_id == current_account.user_id
        ).order_by(ChatMessage.created_at.desc()).limit(11)
        
        result = await db.execute(stmt)
        history_objs = sorted(result.scalars().all(), key=lambda x: x.created_at)
        messages = [{"role": h.role, "content": h.content} for h in history_objs]

        async def event_generator():
            full_content = ""
            async for chunk in stream_chat_response(
                user_name=user.name,
                messages=messages,
                email_context=email_ctx,
                calendar_context=calendar_ctx
            ):
                full_content += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            # Save final response to DB (we need a fresh session because the one from Depends is probably closed or better yet just commit here if possible)
            # Note: StreamingResponse keeps the request context.
            try:
                ai_msg = ChatMessage(
                    user_id=current_account.user_id,
                    session_id=session_id,
                    role="assistant",
                    content=full_content
                )
                db.add(ai_msg)
                await db.commit()
            except Exception as se:
                print(f"Failed to auto-save chat response: {se}")

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Stream chat error: {str(e)}")

@router.get("/history")
async def get_history(
    session_id: str = "default",
    db: AsyncSession = Depends(get_db), 
    current_account: Account = Depends(get_active_account)
):
    stmt = select(ChatMessage).where(
        ChatMessage.session_id == session_id,
        ChatMessage.user_id == current_account.user_id
    ).order_by(ChatMessage.created_at.asc())
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    return [
        {"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
        for m in messages
    ]
