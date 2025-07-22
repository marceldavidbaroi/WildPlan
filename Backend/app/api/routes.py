from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.auth import verify_token   
from app.models import ChatSession, Message
from app.crud import (
    create_chat_session, get_chat_session_by_id,
    get_sessions_by_prefix, get_recent_messages, get_message_count,
    save_message,process_chat_message
)
from sqlalchemy.future import select
from sqlalchemy import delete, update
from uuid import uuid4

router = APIRouter()

# --------------------------
# Chat Session CRUD
# --------------------------

@router.post("/session")
async def create_session(request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    data = await request.json()
    session_id = str(uuid4())
    title = data.get("title", "Untitled Session")
    mood = data.get("mood")
    style = data.get("style")

    session = await create_chat_session(db, uid, session_id, title, mood, style)
    
    return {
        "session_id": session.id,
        "created_at": session.created_at,
        "title": session.title,
        "mood": session.mood,
        "style": session.style,
        # add any other fields you want to return here
    }


@router.get("/session/{id}")
async def get_session(id: str, request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    session = await get_chat_session_by_id(db, id, uid)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session.id,
        "created_at": session.created_at,
        "title": session.title,
        "mood": session.mood,
        "style": session.style,
    }


@router.get("/session/user/{uid}")
async def get_user_sessions(uid: str, request: Request, db: AsyncSession = Depends(get_db)):
    _ = await verify_token(request)  # token check only
    result = await db.execute(select(ChatSession).where(ChatSession.uid == uid))
    sessions = result.scalars().all()
    return [{
        "session_id": s.id,
        "created_at": s.created_at,
        "title": s.title,
        "mood": s.mood,
        "style": s.style
    } for s in sessions]


@router.delete("/session/{id}")
async def delete_session(id: str, request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    session = await get_chat_session_by_id(db, id, uid)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.execute(delete(ChatSession).where(ChatSession.id == id))
    await db.commit()
    return {"message": "Session deleted"}


@router.patch("/session/{id}")
async def update_session(id: str, request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    session = await get_chat_session_by_id(db, id, uid)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    data = await request.json()
    stmt = update(ChatSession).where(ChatSession.id == id).values(
        title=data.get("title", session.title),
        mood=data.get("mood", session.mood),
        style=data.get("style", session.style),
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "Session updated"}


# --------------------------
# Message CRUD
# --------------------------

@router.post("/message")
async def add_message(request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    data = await request.json()
    session_id = data["session_id"]
    role = data["role"]
    content = data["content"]

    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msg = await save_message(db, session_id, role, content)
    return {"message_id": msg.id, "created_at": msg.created_at}


@router.get("/message/session/{session_id}")
async def get_messages(session_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    session = await get_chat_session_by_id(db, session_id, uid)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = await get_recent_messages(db, session_id, limit=1000)
    return [{
        "id": m.id,
        "role": m.role,
        "content": m.content,
        "created_at": m.created_at
    } for m in messages]


@router.delete("/message/{id}")
async def delete_message(id: str, request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    result = await db.execute(select(Message).where(Message.id == id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Optional: Add check that user owns the session
    session = await get_chat_session_by_id(db, msg.session_id, uid)
    if not session:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.execute(delete(Message).where(Message.id == id))
    await db.commit()
    return {"message": "Message deleted"}


@router.post("/chat")
async def chat_entrypoint(request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    data = await request.json()
    user_input = data.get("message")
    session_id = data.get("session_id")  # Optional

    if not user_input:
        raise HTTPException(status_code=400, detail="No message provided")

    assistant_text, final_session_id = await process_chat_message(db, session_id, user_input, uid)

    return {
        "reply": assistant_text,
        "session_id": final_session_id
    }



@router.post("/chat/{session_id}")
async def chat(session_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    uid = await verify_token(request)
    data = await request.json()
    user_input = data.get("message")

    if not user_input:
        raise HTTPException(status_code=400, detail="No message provided")

    assistant_text, final_session_id = await process_chat_message(db, session_id, user_input, uid)

    return {
        "reply": assistant_text,
        "session_id": final_session_id
    }