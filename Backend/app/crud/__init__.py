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

async def create_chat_session(db: AsyncSession, uid: str, session_id: str, title: str, mood=None, style=None):
    print("[create_chat_session] Start")
    session = ChatSession(
        id=session_id,
        uid=uid,
        title=title,
        mood=mood,
        style=style
    )
    db.add(session)
    try:
        await db.commit()
        await db.refresh(session)
        print(f"[create_chat_session] Chat session created: {session.id} (Title: {title})")
    except Exception as e:
        await db.rollback()
        print(f"[create_chat_session] Failed: {e}")
        return None
    print("[create_chat_session] End")
    return session

async def get_chat_session_by_id(db: AsyncSession, session_id: str, uid: str):
    print(f"[get_chat_session_by_id] Fetching session: {session_id}")
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.uid == uid)
    )
    session = result.scalars().first()
    print(f"[get_chat_session_by_id] Result: {session}")
    return session

async def get_sessions_by_prefix(db: AsyncSession, prefix: str, uid: str):
    print(f"[get_sessions_by_prefix] Fetching sessions with prefix: {prefix}")
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.uid == uid)
        .where(ChatSession.id.like(f"{prefix}%"))
        .order_by(desc(ChatSession.created_at))
    )
    sessions = result.scalars().all()
    print(f"[get_sessions_by_prefix] Found {len(sessions)} sessions")
    return sessions

async def update_chat_session(db: AsyncSession, session_id: str, uid: str, title=None, mood=None, style=None):
    print(f"[update_chat_session] Start for session: {session_id}")
    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        print(f"[update_chat_session] Session not found")
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
    print(f"[update_chat_session] Updated session: {session_id}")
    return session

async def delete_chat_session(db: AsyncSession, session_id: str, uid: str):
    print(f"[delete_chat_session] Start for session: {session_id}")
    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        print(f"[delete_chat_session] Session not found")
        return False
    await db.execute(
        Message.__table__.delete().where(Message.session_id == session_id)
    )
    await db.delete(session)
    await db.commit()
    print(f"[delete_chat_session] Session and messages deleted: {session_id}")
    return True

# -------------------------------
# 💬 Message CRUD
# -------------------------------

async def save_message(db: AsyncSession, session_id: str, role: str, content: str):
    print(f"[save_message] Start: {role} -> {session_id}")
    msg = Message(session_id=session_id, role=role, content=content)
    db.add(msg)
    try:
        await db.commit()
        await db.refresh(msg)
        print(f"[save_message] Message saved: {msg.id} ({role})")
    except Exception as e:
        await db.rollback()
        print(f"[save_message] Failed: {e}")
        return None
    print(f"[save_message] End: {msg.id}")
    return msg

async def get_recent_messages(db: AsyncSession, session_id: str, limit=60):
    print(f"[get_recent_messages] Fetching last {limit} messages for session: {session_id}")
    result = await db.execute(
        select(Message).where(Message.session_id == session_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))
    print(f"[get_recent_messages] Fetched {len(messages)} messages")
    return messages

async def get_message_count(db: AsyncSession, session_id: str):
    print(f"[get_message_count] Counting messages for session: {session_id}")
    result = await db.execute(
        select(func.count()).select_from(Message).where(Message.session_id == session_id)
    )
    count = result.scalar_one()
    print(f"[get_message_count] Count: {count}")
    return count

async def update_message(db: AsyncSession, message_id: str, session_id: str, new_content: str):
    print(f"[update_message] Start for message: {message_id}")
    result = await db.execute(
        select(Message).where(Message.id == message_id, Message.session_id == session_id)
    )
    message = result.scalars().first()
    if not message:
        print(f"[update_message] Message not found")
        return None
    message.content = new_content
    message.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(message)
    print(f"[update_message] Message updated: {message_id}")
    return message

async def delete_message(db: AsyncSession, message_id: str, session_id: str):
    print(f"[delete_message] Start for message: {message_id}")
    result = await db.execute(
        select(Message).where(Message.id == message_id, Message.session_id == session_id)
    )
    message = result.scalars().first()
    if not message:
        print(f"[delete_message] Message not found")
        return False
    await db.delete(message)
    await db.commit()
    print(f"[delete_message] Message deleted: {message_id}")
    return True

# -------------------------------
# 🧠 Chat with Context (LLM Prompting)
# -------------------------------

MAX_CONTEXT_MESSAGES = 30


async def process_chat_message(db: AsyncSession, session_id: str, user_input: str, uid: str):
    print(f"[process_chat_message] Start for session: {session_id}")
    session_title = None  # to store the chat title

    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        session_id = str(uuid.uuid4())
        session_title = f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        session = await create_chat_session(
            db=db,
            uid=uid,
            session_id=session_id,
            title=session_title,
            mood="neutral",
            style="default"
        )
    else:
        session_title = session.title

    await save_message(db, session.id, "user", user_input)

    messages = await get_recent_messages(db, session.id, limit=MAX_CONTEXT_MESSAGES)

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

    prompt_parts = [f"{m.role}: {m.content}" for m in messages]
    if weather_note:
        prompt_parts.append(f"system: {weather_note}")
    prompt_text = "\n".join(prompt_parts)

    assistant_chunks = []
    async for chunk in ollama_stream(prompt_text):
        assistant_chunks.append(chunk)
    assistant_text = "".join(assistant_chunks).strip()

    await save_message(db, session.id, "assistant", assistant_text)

    print(f"[process_chat_message] End for session: {session.id}")
    return assistant_text, session.id, session_title