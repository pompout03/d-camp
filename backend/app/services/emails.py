import base64
from typing import List, Dict, Any
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import re
import asyncio

from app.models.account import Account
from app.core.config import settings

from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth import refresh_account_token

async def get_gmail_service(account: Account, db: AsyncSession):
    """
    Constructs a Gmail API service instance from the account's stored OAuth credentials,
    after ensuring the token is refreshed and persisted.
    """
    creds = await refresh_account_token(account, db)
    return build('gmail', 'v1', credentials=creds)

def _get_header(headers: List[Dict[str, str]], name: str) -> str:
    """
    Extracts a specific header by name, case-insensitive.
    """
    for h in headers:
        if h['name'].lower() == name.lower():
            return h['value']
    return ""

def _extract_email_address(sender_value: str) -> str:
    """
    Extracts purely the email address from a sender string like "Name <email@domain.com>".
    """
    match = re.search(r'<([^>]+)>', sender_value)
    if match:
        return match.group(1)
    return sender_value.strip()

def _parse_parts(parts: List[Dict[str, Any]]) -> tuple[str, str]:
    """
    Recursively parse MIME parts to extract plain text and HTML body exactly as delivered.
    """
    body_plain = ""
    body_html = ""
    
    for part in parts:
        mime_type = part.get('mimeType')
        body = part.get('body', {})
        data = body.get('data')
        
        if mime_type == 'text/plain' and data:
            try:
                # Gmail uses url-safe base64 encoding
                decoded = base64.urlsafe_b64decode(data + '=' * (-len(data) % 4)).decode('utf-8')
                body_plain += decoded
            except Exception:
                pass
        elif mime_type == 'text/html' and data:
            try:
                decoded = base64.urlsafe_b64decode(data + '=' * (-len(data) % 4)).decode('utf-8')
                body_html += decoded
            except Exception:
                pass
        
        # Recurse for multipart/alternative or multipart/mixed
        if 'parts' in part:
            child_plain, child_html = _parse_parts(part['parts'])
            body_plain += child_plain
            body_html += child_html
            
    return body_plain, body_html

async def fetch_emails_from_gmail(account: Account, db: AsyncSession, max_results: int = 30) -> List[Dict[str, Any]]:
    """
    Fetch exact emails as they appear in Gmail for the connected account.
    Extracts both the plain text and rich HTML body perfectly.
    """
    service = await get_gmail_service(account, db)
    
    # We fetch thread or message list
    results = await asyncio.to_thread(service.users().messages().list(userId='me', maxResults=max_results).execute)
    messages = results.get('messages', [])
    
    email_data_list = []
    
    for message in messages:
        msg = await asyncio.to_thread(service.users().messages().get(userId='me', id=message['id'], format='full').execute)
        
        payload = msg.get('payload', {})
        headers = payload.get('headers', [])
        
        subject = _get_header(headers, 'Subject') or "No Subject"
        sender = _get_header(headers, 'From') or "Unknown Sender"
        sender_email = _extract_email_address(sender)
        date = _get_header(headers, 'Date')
        
        body_plain = ""
        body_html = ""
        
        if 'parts' in payload:
            body_plain, body_html = _parse_parts(payload['parts'])
        else:
            # Single part email
            mime_type = payload.get('mimeType')
            data = payload.get('body', {}).get('data')
            if data:
                try:
                    decoded = base64.urlsafe_b64decode(data + '=' * (-len(data) % 4)).decode('utf-8')
                    if mime_type == 'text/plain':
                        body_plain = decoded
                    elif mime_type == 'text/html':
                        body_html = decoded
                except Exception:
                    pass
                
        email_data_list.append({
            'gmail_id': message['id'],
            'thread_id': msg.get('threadId'),
            'subject': subject,
            'sender': sender,
            'sender_email': sender_email,
            'date': date,
            'snippet': msg.get('snippet'),
            'body': body_plain,
            'body_html': body_html
        })
        
    return email_data_list
