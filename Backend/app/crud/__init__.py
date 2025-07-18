from sqlalchemy.future import select
from sqlalchemy import desc, func
from app.models import TripPreference, ChatSession, Message

async def create_trip_pref(db, uid, location, mood, style):
    pref = TripPreference(uid=uid, location=location, mood=mood, style=style)
    db.add(pref)
    await db.commit()
    await db.refresh(pref)
    return pref

async def create_chat_session(db, uid, trip_pref_id, session_id):
    session = ChatSession(id=session_id, uid=uid, trip_pref_id=trip_pref_id)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

async def get_chat_session_by_id(db, session_id, uid):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.uid == uid)
    )
    return result.scalars().first()

async def get_recent_messages(db, session_id, limit=30):
    result = await db.execute(
        select(Message).where(Message.session_id == session_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    return list(reversed(result.scalars().all()))

async def get_message_count(db, session_id):
    result = await db.execute(
        select(func.count()).select_from(Message).where(Message.session_id == session_id)
    )
    return result.scalar_one()

async def save_message(db, session_id, role, content):
    msg = Message(session_id=session_id, role=role, content=content)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

async def get_sessions_by_prefix(db, prefix, uid):
    result = await db.execute(
        select(ChatSession).where(ChatSession.uid == uid).where(ChatSession.id.like(f"{prefix}%"))
        .order_by(desc(ChatSession.started_at))
    )
    return result.scalars().all()
