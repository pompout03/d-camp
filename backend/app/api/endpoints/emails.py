from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json

from app.db.session import get_db, AsyncSessionLocal
from app.models.user import User
from app.models.account import Account
from app.models.email import Email
from app.services.emails import fetch_emails_from_gmail
from app.ai.service import analyze_emails_batch
from app.services.auth import get_active_account, get_current_user_from_session
from app.schemas.digest import WeeklyDigestResponse, SenderVolume
from datetime import datetime, timedelta, timezone
from sqlalchemy import func

def sanitize_str(val):
    if not isinstance(val, str):
        return val
    return val.replace('\x00', '')

def parse_action_items(action_items_str):
    if not action_items_str:
        return []
    try:
        parsed = json.loads(action_items_str)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []

router = APIRouter(prefix="/api/inbox", tags=["Emails"])

# Dependency is now imported from service.py

from app.models.settings import UserSetting

async def perform_email_sync(current_account: Account, db: AsyncSession) -> dict:
    """
    Fetches emails from Gmail for a specific account, then runs Gemini AI analysis.
    """
    print(f"\n[SYNC START] Account: {current_account.email} (ID: {current_account.id})")
    try:
        # Step 0: Fetch User Settings for Priority Rules
        stmt_settings = select(UserSetting).where(UserSetting.user_id == current_account.user_id)
        res_settings = await db.execute(stmt_settings)
        user_settings = res_settings.scalar_one_or_none()
        
        trusted_senders = user_settings.trusted_senders if user_settings else []
        key_phrases = user_settings.key_phrases if user_settings else []

        # Step 1: Fetch raw emails from Gmail (latest 30)
        print(f"[SYNC] Step 1: Connecting to Gmail API...")
        try:
            raw_emails = await fetch_emails_from_gmail(current_account, db, max_results=30)
            print(f"[SYNC] Step 1: Successfully fetched {len(raw_emails)} raw emails from Gmail.")
        except Exception as e:
            print(f"[SYNC ERROR] Gmail Fetch Failed: {str(e)}")
            return {
                "message": "Failed to connect to Gmail to fetch new emails.",
                "synced": 0,
                "analyzed": 0,
                "error": True
            }
        
        if not raw_emails:
            return {"message": "No emails found in Gmail.", "synced": 0, "analyzed": 0}

        print(f"[SYNC] Step 2: Filtering {len(raw_emails)} emails against DB records...")
        gmail_ids = [e['gmail_id'] for e in raw_emails]
        stmt = select(Email).where(Email.gmail_id.in_(gmail_ids), Email.user_id == current_account.user_id)
        result = await db.execute(stmt)
        existing_emails = {e.gmail_id: e for e in result.scalars().all()}
        print(f"[SYNC] Found {len(existing_emails)} existing emails in DB.")

        new_emails_to_save = []
        emails_to_analyze_data = []
        email_objects_map: dict[str, Email] = {}

        for email_data in raw_emails:
            g_id = email_data['gmail_id']
            existing = existing_emails.get(g_id)

            if not existing:
                # Completely new email
                new_email = Email(
                    user_id=current_account.user_id,
                    gmail_id=email_data['gmail_id'],
                    thread_id=email_data['thread_id'],
                    subject=sanitize_str(email_data['subject']),
                    sender=sanitize_str(email_data['sender']),
                    sender_email=sanitize_str(email_data['sender_email']),
                    snippet=sanitize_str(email_data['snippet']),
                    body=sanitize_str(email_data['body']),
                    body_html=sanitize_str(email_data['body_html']),
                )
                db.add(new_email)
                new_emails_to_save.append(new_email)
                emails_to_analyze_data.append(email_data)
                email_objects_map[g_id] = new_email
            elif existing.priority is None:
                # In DB but failed analysis before
                emails_to_analyze_data.append(email_data)
                email_objects_map[g_id] = existing

        # First stage commit: Save new emails (placeholders)
        if new_emails_to_save:
            await db.commit()
        
        if not emails_to_analyze_data:
            print("[SYNC DONE] All fetched emails already exist and were correctly analyzed.")
            return {
                "message": "No new emails to analyze. All current emails are already prioritized in your database.",
                "synced": 0,
                "analyzed": 0,
            }

        # Step 3: Run Gemini AI analysis on the filtered subset
        print(f"[SYNC] Step 3: Running Gemini AI analysis on {len(emails_to_analyze_data)} emails...")
        analyzed_count = 0
        ai_results = await analyze_emails_batch(
            emails_to_analyze_data,
            trusted_senders=trusted_senders,
            key_phrases=key_phrases
        )

        for email_data, ai in zip(emails_to_analyze_data, ai_results):
            email_obj = email_objects_map.get(email_data['gmail_id'])
            if not email_obj:
                continue

            if ai:
                # Update AI fields with valid analysis
                email_obj.priority = ai.get("priority")
                email_obj.urgency_tier = ai.get("urgency_tier")
                email_obj.needs_response = ai.get("needs_response")
                email_obj.summary = ai.get("summary")
                email_obj.action_items = json.dumps(ai.get("action_items", []))
                email_obj.category = ai.get("category")
                email_obj.sentiment = ai.get("sentiment")
                email_obj.deadline_detected = ai.get("deadline_detected")
                email_obj.meeting_detected = ai.get("meeting_detected")
                meeting = ai.get("meeting") or {}
                email_obj.meeting_title = meeting.get("title")
                email_obj.meeting_date = meeting.get("date")
                email_obj.meeting_time = meeting.get("time")
                email_obj.meeting_duration = meeting.get("duration_minutes")
                email_obj.meeting_location = meeting.get("location")
                email_obj.form_detected = ai.get("form_detected")
                email_obj.form_description = ai.get("form_description")
                email_obj.waiting_on = ai.get("waiting_on")
                analyzed_count += 1
            else:
                # Fallback: Set a default summary if AI failed
                email_obj.summary = "AI analysis failed for this email. Please check the original content."
                email_obj.priority = "medium" # Default
                email_obj.action_items = json.dumps([])

        # Second stage commit: Save AI results
        await db.commit()
        print(f"[SYNC DONE] Successfully saved {analyzed_count} AI analysis results.")
        
        message = f"Sync complete. {analyzed_count} emails analyzed."
        if analyzed_count < len(emails_to_analyze_data):
            message += f" ({len(emails_to_analyze_data) - analyzed_count} failed analysis and used fallback info)."
            
        return {
            "message": message,
            "synced": len(emails_to_analyze_data),
            "analyzed": analyzed_count,
            "failed": len(emails_to_analyze_data) - analyzed_count
        }
        
    except Exception as e:
        await db.rollback()
        # Log the error and return a graceful response so the frontend still fetches existing emails
        print(f"Sync Router Error: {str(e)}")
        return {
            "message": f"Sync encountered an error: {str(e)}. Existing emails will be displayed.",
            "synced": 0,
            "analyzed": 0,
            "error": True
        }

async def background_sync_emails(account_id: str):
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(Account).where(Account.id == account_id)
            account = (await db.execute(stmt)).scalar_one_or_none()
            if account:
                await perform_email_sync(account, db)
    except Exception as e:
        print(f"Background Sync Error: {str(e)}")

@router.post("/sync")
async def sync_emails(
    request: Request, 
    db: AsyncSession = Depends(get_db), 
    current_account: Account = Depends(get_active_account)
):
    return await perform_email_sync(current_account, db)

@router.put("/accounts/toggle")
async def toggle_account_active(
    active: bool,
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account)
):
    """
    Toggles the connection status of the active account.
    """
    current_account.is_active = active
    await db.commit()
    return {"status": "success", "is_active": current_account.is_active}


@router.get("/digest", response_model=WeeklyDigestResponse)
async def get_weekly_digest(
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account),
):
    """
    Returns a weekly digest including stats and top senders.
    """
    try:
        # Calculate start of current week (last 7 days)
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        
        # 1. Fetch all emails from this week for this user
        stmt = select(Email).where(
            Email.user_id == current_account.user_id,
            Email.synced_at >= week_ago
        )
        result = await db.execute(stmt)
        emails = result.scalars().all()
        
        # 2. Basic Stats
        total = len(emails)
        high_priority = len([e for e in emails if e.priority == "high"])
        needs_response = len([e for e in emails if e.needs_response])
        meetings = len([e for e in emails if e.meeting_detected])
        
        # 3. Top Senders (Aggregation)
        # We group by sender_email (or sender if email is missing)
        sender_counts = {}
        for e in emails:
            key = e.sender_email or e.sender
            if key not in sender_counts:
                sender_counts[key] = {"name": e.sender.split("<")[0].strip(), "email": e.sender_email or "", "count": 0}
            sender_counts[key]["count"] += 1
            
        top_senders_data = sorted(sender_counts.values(), key=lambda x: x["count"], reverse=True)[:5]
        top_senders = [SenderVolume(**s) for s in top_senders_data]
        
        # 4. Insights & Productivity Score
        # Mock logic for score based on response needs
        score = 100 - (needs_response * 2) if total > 0 else 100
        score = max(0, min(100, score))
        
        insight = "You're staying on top of things! "
        if high_priority > 0:
            insight += f"Your AI triaged {high_priority} critical items."
        else:
            insight += "No critical items detected this week."
            
        return {
            "total_analyzed": total,
            "high_priority_count": high_priority,
            "needs_response_count": needs_response,
            "meetings_count": meetings,
            "top_senders": top_senders,
            "productivity_score": score,
            "insight_text": insight
        }
    except Exception as e:
        print(f"Error in GET /api/inbox/digest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.get("/stats")
async def get_email_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account),
):
    """
    Returns high-level stats for the active account.
    """
    try:
        stmt = select(Email).where(Email.user_id == current_account.user_id)
        result = await db.execute(stmt)
        emails = result.scalars().all()
        
        total = len(emails)
        high_priority = len([e for e in emails if e.priority == "high"])
        needs_response = len([e for e in emails if e.needs_response])
        meetings = len([e for e in emails if e.meeting_detected])
        
        return {
            "total_analyzed": total,
            "high_priority_count": high_priority,
            "needs_response_count": needs_response,
            "meetings_count": meetings,
            "time_saved_hours": round(total * 0.1, 1), # Simple estimate: 6 mins per email
        }
    except Exception as e:
        print(f"Error in GET /api/emails/stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.get("")
async def get_emails(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account),
    category: str | None = None,
    tier: str | None = None,
    priority: str | None = None,
):
    """
    Returns synced emails for the active account.
    """
    try:
        stmt = select(Email).where(Email.user_id == current_account.user_id)

        if category:
            stmt = stmt.where(Email.category == category)
        if tier:
            # Case-insensitive partial match for urgency_tier
            stmt = stmt.where(Email.urgency_tier.ilike(f"%{tier}%"))
        if priority:
            stmt = stmt.where(Email.priority == priority)

        stmt = stmt.order_by(Email.synced_at.desc()).limit(50)
        result = await db.execute(stmt)
        emails = result.scalars().all()
        
        return [
            {
                "id": e.id,
                "gmail_id": e.gmail_id,
                "subject": e.subject,
                "sender": e.sender,
                "sender_email": e.sender_email,
                "snippet": e.snippet,
                "synced_at": str(e.synced_at),
                # AI fields
                "priority": e.priority,
                "urgency_tier": e.urgency_tier,
                "needs_response": e.needs_response,
                "summary": e.summary,
                "action_items": parse_action_items(e.action_items),
                "category": e.category,
                "sentiment": e.sentiment,
                "deadline_detected": e.deadline_detected,
                "meeting_detected": e.meeting_detected,
                "meeting_title": e.meeting_title,
                "meeting_date": e.meeting_date,
                "meeting_time": e.meeting_time,
                "meeting_duration": e.meeting_duration,
                "meeting_location": e.meeting_location,
                "form_detected": e.form_detected,
                "form_description": e.form_description,
                "waiting_on": e.waiting_on,
            }
            for e in emails
        ]
    except Exception as e:
        print(f"Error in GET /api/emails: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.get("/{email_id}")
async def get_email_detail(
    email_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_account: Account = Depends(get_active_account),
):
    """
    Returns full details for a single email.
    """
    try:
        stmt = select(Email).where(Email.id == email_id, Email.user_id == current_account.user_id)
        result = await db.execute(stmt)
        e = result.scalar_one_or_none()
        
        if not e:
            raise HTTPException(status_code=404, detail="Email not found")
            
        return {
            "id": e.id,
            "gmail_id": e.gmail_id,
            "subject": e.subject,
            "sender": e.sender,
            "sender_email": e.sender_email,
            "snippet": e.snippet,
            "body": e.body,
            "body_html": e.body_html,
            "synced_at": str(e.synced_at),
            # AI fields
            "priority": e.priority,
            "urgency_tier": e.urgency_tier,
            "needs_response": e.needs_response,
            "summary": e.summary,
            "action_items": parse_action_items(e.action_items),
            "category": e.category,
            "sentiment": e.sentiment,
            "deadline_detected": e.deadline_detected,
            "meeting_detected": e.meeting_detected,
            "meeting_title": e.meeting_title,
            "meeting_date": e.meeting_date,
            "meeting_time": e.meeting_time,
            "meeting_duration": e.meeting_duration,
            "meeting_location": e.meeting_location,
            "form_detected": e.form_detected,
            "form_description": e.form_description,
            "waiting_on": e.waiting_on,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in GET /api/emails/{{email_id}}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
