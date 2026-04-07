import json
import re
import asyncio
from typing import Optional, Dict, Any

from google import genai
from app.core.config import settings

# Initialize Gemini client on import
_client = None

def get_client():
    global _client
    if _client is None and settings.GEMINI_API_KEY:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

_model_name = "gemini-2.5-flash"  # Using the latest flash model

def get_model_name():
    return _model_name

ANALYSIS_PROMPT = """You are an AI email analyst for a professional workflow assistant.
Analyze the following email and respond ONLY with valid JSON.

Email:
  From: {sender}
  Subject: {subject}
  Date: {date}
  Body: {body_text}

USER-SPECIFIC PRIORITY RULES:
{priority_rules}

GENERAL PRIORITIZATION RULES:
1. Priority (high|medium|low):
   - 'high': Direct actionable requests from important people, urgent deadlines, critical account issues.
   - 'medium': Internal team updates, non-urgent tasks, important info to know.
   - 'low': Newsletters, cold outreach, generic notifications, social updates.

2. Urgency Tier (Immediate Attention|Needs Response|Can Wait):
   - 'Immediate Attention': Action needed within 4 hours.
   - 'Needs Response': Action or reply needed within 1-2 days.
   - 'Can Wait': Purely informational, read whenever, or no action needed.

3. Category: work, finance, personal, meeting, form, newsletter, notification, other.

4. Waiting On (true|false): Is the user currently waiting for a reply or action from the sender? Or is the sender waiting for a specific response from the user?

Return a JSON object with EXACTLY these fields:
{{
  "priority": "high" | "medium" | "low",
  "urgency_tier": "Immediate Attention" | "Needs Response" | "Can Wait",
  "needs_response": true | false,
  "summary": "Concise 1-2 sentence summary of the core message",
  "action_items": ["clear actionable task 1", "clear actionable task 2"],
  "category": "category_name",
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "deadline_detected": "YYYY-MM-DD HH:MM" | null,
  "meeting_detected": true | false,
  "meeting": {{
    "title": "...",
    "date": "YYYY-MM-DD" | null,
    "time": "HH:MM" | null,
    "duration_minutes": 30,
    "location": "..." | null
  }},
  "form_detected": true | false,
  "form_description": "What form needs filling?" | null,
  "waiting_on": true | false
}}

Note: Return ONLY the JSON object. No conversational text."""


def _clean_json_response(text: str) -> str:
    """Extract and clean the first JSON object from model response."""
    text = text.strip()
    
    # 1. Try to find JSON within code blocks
    code_block_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if code_block_match:
        return code_block_match.group(1).strip()
        
    # 2. Try to find the first '{' and last '}'
    json_match = re.search(r'(\{.*\})', text, re.DOTALL)
    if json_match:
        return json_match.group(1).strip()
        
    return text


async def analyze_email(
    sender: str,
    subject: str,
    date: str,
    body_text: str,
    trusted_senders: list[str] = [],
    key_phrases: list[str] = [],
) -> Optional[Dict[str, Any]]:
    """
    Send a single email to Gemini for AI analysis.
    Returns parsed JSON dict or None if analysis fails.
    """
    if not settings.GEMINI_API_KEY:
        return None

    # Truncate body to avoid hitting context limits
    body_trimmed = (body_text or "")[:4000]

    # Format user rules
    rules_text = ""
    if trusted_senders:
        rules_text += f"- ALWAYS mark emails from these senders as 'high' priority: {', '.join(trusted_senders)}\n"
    if key_phrases:
        rules_text += f"- ALWAYS mark emails containing these phrases as 'high' priority: {', '.join(key_phrases)}\n"
    if not rules_text:
        rules_text = "No specific user rules provided. Use general rules."

    prompt = ANALYSIS_PROMPT.format(
        sender=sender or "Unknown",
        subject=subject or "No Subject",
        date=date or "",
        body_text=body_trimmed,
        priority_rules=rules_text,
    )

    try:
        client = get_client()
        if not client:
            return None
            
        # Run synchronous Gemini call in a thread so we stay async-friendly
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=get_model_name(),
            contents=prompt
        )
        
        if not response.text:
            print(f"AI Error: Empty response for email from {sender}")
            return None
            
        raw = response.text
        cleaned = _clean_json_response(raw)
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"AI Error: Invalid JSON from Gemini for {sender}: {str(e)}")
        return None
    except Exception as e:
        print(f"AI Error: Failed to analyze email from {sender}: {str(e)}")
        return None


CHAT_SYSTEM_PROMPT = """You are Decamp AI, a sophisticated Chief of Staff for a high-performance professional.
Today is {today_date}. User: {user_name}.

YOUR ROLE:
- You are the ultimate gatekeeper and strategist for the user's time and communications.
- Be concise, elite, and proactive only when relevant.

WORKSPACE CONTEXT:
{email_context}

{calendar_context}

STRICT GUIDELINES:
1. Use markdown for professional formatting (bolding key terms, lists for action items).
2. Answer ONLY what the user asks directly, using the context provided.
3. If asked for a "briefing" or "summary of my day," consolidate the High Priority emails and upcoming meetings into a brief, executive summary.
4. If the info is not in the context, say: "I don't have that information in your recent workspace data."
5. NO unsolicited advice. Be a high-level executive assistant."""


async def get_chat_response(
    user_name: str,
    messages: list,
    email_context: str,
) -> Optional[str]:
    """
    Generate a response from Gemini using chat history and email context.
    messages: list of {"role": "user" | "assistant", "content": str}
    """
    if not settings.GEMINI_API_KEY:
        return "AI analysis is currently disabled (no API key)."

    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    system_prompt = CHAT_SYSTEM_PROMPT.format(
        today_date=today,
        user_name=user_name,
        email_context=email_context,
        calendar_context="" # Fallback for non-streaming
    )

    try:
        latest_message = messages[-1]["content"] if messages else ""
        client = get_client()
        if not client:
            return "AI analysis is currently disabled (no API key)."
            
        full_user_input = f"{system_prompt}\n\nUSER MESSAGE: {latest_message}"
        
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=get_model_name(),
            contents=full_user_input,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_prompt if latest_message else None
            )
        )
        return response.text
    except Exception:
        pass
            
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"


async def stream_chat_response(
    user_name: str,
    messages: list,
    email_context: str,
    calendar_context: str = ""
):
    """
    Generate a streaming response from Gemini using chat history and context.
    """
    if not settings.GEMINI_API_KEY:
        yield "AI analysis is currently disabled (no API key)."
        return

    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    
    system_prompt = CHAT_SYSTEM_PROMPT.format(
        today_date=today,
        user_name=user_name,
        email_context=email_context,
        calendar_context=calendar_context
    )

    try:
        client = get_client()
        if not client:
            yield "AI analysis is currently disabled (no API key)."
            return
            
        latest_message = messages[-1]["content"] if messages else ""
        full_user_input = f"{system_prompt}\n\nUSER MESSAGE: {latest_message}"
        
        # Streaming call using new SDK
        response = await asyncio.to_thread(
            client.models.generate_content_stream,
            model=get_model_name(),
            contents=full_user_input
        )
        
        for chunk in response:
            if chunk.text:
                yield chunk.text
                
    except Exception as e:
        yield f"Error communicating with AI: {str(e)}"


async def analyze_emails_batch(
    emails: list,
    trusted_senders: list[str] = [],
    key_phrases: list[str] = []
) -> list:
    """
    Analyze a batch of email dicts concurrently using asyncio.gather.
    Each email dict must have: sender, subject, date, body (plain text).
    Returns list of analysis dicts (None for any that failed).
    """
    tasks = [
        analyze_email(
            sender=e.get("sender", ""),
            subject=e.get("subject", ""),
            date=e.get("date", ""),
            body_text=e.get("body", "") or e.get("snippet", ""),
            trusted_senders=trusted_senders,
            key_phrases=key_phrases
        )
        for e in emails
    ]
    return await asyncio.gather(*tasks)
