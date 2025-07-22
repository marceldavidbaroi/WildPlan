from sqlalchemy.future import select
from sqlalchemy import desc, func
from app.models import ChatSession, Message
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.services.ollama import ollama_stream
import uuid
from app.services.weather import get_lat_lon, get_weather
import re
# -------------------------------
# 📘 ChatSession CRUD
# -------------------------------

# Create a new chat session
async def create_chat_session(db: AsyncSession, uid: str, session_id: str, title: str, mood=None, style=None):
    session = ChatSession(
        id=session_id,
        uid=uid,
        title=title,
        mood=mood,
        style=style
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

# Read a chat session by ID and user
async def get_chat_session_by_id(db: AsyncSession, session_id: str, uid: str):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.uid == uid)
    )
    return result.scalars().first()

# Read chat sessions by ID prefix
async def get_sessions_by_prefix(db: AsyncSession, prefix: str, uid: str):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.uid == uid)
        .where(ChatSession.id.like(f"{prefix}%"))
        .order_by(desc(ChatSession.created_at))
    )
    return result.scalars().all()

# Update chat session fields
async def update_chat_session(db: AsyncSession, session_id: str, uid: str, title=None, mood=None, style=None):
    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        return None
    if title is not None:
        session.title = title
    if mood is not None:
        session.mood = mood
    if style is not None:
        session.style = style
    session.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)
    return session

# Delete chat session and its messages
async def delete_chat_session(db: AsyncSession, session_id: str, uid: str):
    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        return False
    # Delete messages
    await db.execute(
        Message.__table__.delete().where(Message.session_id == session_id)
    )
    # Delete session
    await db.delete(session)
    await db.commit()
    return True

# -------------------------------
# 💬 Message CRUD
# -------------------------------

# Create/save a message
async def save_message(db: AsyncSession, session_id: str, role: str, content: str):
    msg = Message(session_id=session_id, role=role, content=content)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

# Read recent messages (limit 60 total)
async def get_recent_messages(db: AsyncSession, session_id: str, limit=60):
    result = await db.execute(
        select(Message).where(Message.session_id == session_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    return list(reversed(result.scalars().all()))

# Count total messages in a session
async def get_message_count(db: AsyncSession, session_id: str):
    result = await db.execute(
        select(func.count()).select_from(Message).where(Message.session_id == session_id)
    )
    return result.scalar_one()

# Update a message's content
async def update_message(db: AsyncSession, message_id: str, session_id: str, new_content: str):
    result = await db.execute(
        select(Message).where(Message.id == message_id, Message.session_id == session_id)
    )
    message = result.scalars().first()
    if not message:
        return None
    message.content = new_content
    message.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(message)
    return message

# Delete a specific message
async def delete_message(db: AsyncSession, message_id: str, session_id: str):
    result = await db.execute(
        select(Message).where(Message.id == message_id, Message.session_id == session_id)
    )
    message = result.scalars().first()
    if not message:
        return False
    await db.delete(message)
    await db.commit()
    return True

# -------------------------------
# 🧠 Chat with Context (LLM Prompting)
# -------------------------------

MAX_CONTEXT_MESSAGES = 30

async def process_chat_message(db: AsyncSession, session_id: str, user_input: str, uid: str):
    # 1. Fetch existing session or create a new one
    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        session_id = str(uuid.uuid4())
        session = await create_chat_session(
            db=db,
            uid=uid,
            session_id=session_id,
            title="New Chat",
            mood="neutral",
            style="default"
        )

    # 2. Save the user's message immediately
    await save_message(db, session.id, "user", user_input)

    # 3. Fetch the last MAX_CONTEXT_MESSAGES messages to build context
    messages = await get_recent_messages(db, session.id, limit=MAX_CONTEXT_MESSAGES)

    # 4. Basic weather intent detection and fetching weather info
    weather_note = ""
    match = re.search(r"weather in ([\w\s,]+)", user_input.lower())
    if match:
        location = match.group(1).strip()
        try:
            lat, lon = await get_lat_lon(location)
            weather_data = await get_weather(lat, lon)
            weather_note = (
                f"[Weather Info for {location.title()}]\n"
                f"Temperature: {weather_data['temperature']}°C\n"
                f"Wind: {weather_data['windspeed']} km/h\n"
            )
        except Exception:
            weather_note = f"[Could not fetch weather for '{location}']"

    # 5. Build the prompt text for the assistant, including weather info if any
    prompt_parts = [f"{m.role}: {m.content}" for m in messages]
    if weather_note:
        prompt_parts.append(f"system: {weather_note}")
    prompt_text = "\n".join(prompt_parts)

    # 6. Stream assistant response from Ollama, accumulate all chunks
    assistant_chunks = []
    async for chunk in ollama_stream(prompt_text):
        assistant_chunks.append(chunk)
    assistant_text = "".join(assistant_chunks).strip()

    # 7. Save the complete assistant response after it's fully received
    await save_message(db, session.id, "assistant", assistant_text)

    # 8. Return the assistant's full reply and the session ID
    return assistant_text, session.id
