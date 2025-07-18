from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from app.auth import verify_token
from app.db import get_db
from app.crud import (
    create_trip_pref, create_chat_session, save_message,
    get_chat_session_by_id, get_recent_messages,
    get_message_count, get_sessions_by_prefix
)
from app.services.weather import get_lat_lon, get_weather
from app.services.ollama import ollama_stream
import uuid


router = APIRouter()
@router.post("/chat/{session_id}")
async def chat(session_id: str, request: Request, db=Depends(get_db)):
    uid = await verify_token(request)
    body = await request.json()
    user_msg = body.get("message")
    location = body.get("location", "San Francisco")
    mood = body.get("mood", "friendly")
    style = body.get("style", "casual")

    # If client asks for a new session, generate a unique UUID for session_id
    if session_id.lower() == "new":
        session_id = str(uuid.uuid4())
        session = None
    else:
        # Try to find existing session with this id & uid
        session = await get_chat_session_by_id(db, session_id, uid)

    # If session doesn't exist, create one
    if not session:
        lat, lon = await get_lat_lon(location)
        weather = await get_weather(lat, lon)
        pref = await create_trip_pref(db, uid, location, mood, style)

        try:
            session = await create_chat_session(db, uid, pref.id, session_id=session_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create session: {str(e)}")

        await save_message(db, session.id, "user", user_msg)
        intro = f"You are a {mood} assistant. Location: {location}. Weather: {weather}."
    else:
        count = await get_message_count(db, session_id)
        if count >= 60:
            return JSONResponse({"message": "This session has reached the 30-message limit. Please create a new session."}, status_code=403)
        await save_message(db, session.id, "user", user_msg)
        intro = ""

    messages = await get_recent_messages(db, session.id, limit=30)
    context = "\n".join([f"{m.role.capitalize()}: {m.content}" for m in messages])
    prompt = f"{intro}\n{context}\nUser: {user_msg}\nAssistant:"

    async def stream():
        buffer = ""
        print("⏳ Starting assistant response stream...", prompt)  # Server-side log
        yield "[Assistant is typing...]\n"

        async for chunk in ollama_stream(prompt):
            buffer += chunk
            yield chunk
        await save_message(db, session.id, "assistant", buffer.strip())
        print("✅ Assistant response complete and saved.")

    return StreamingResponse(stream(), media_type="text/plain")

@router.get("/chat/history/{prefix}")
async def get_chat_history(prefix: str, request: Request, db=Depends(get_db)):
    uid = await verify_token(request)
    sessions = await get_sessions_by_prefix(db, prefix, uid)
    history = []

    for session in sessions:
        messages = await get_recent_messages(db, session.id, limit=1000)
        history.append({
            "session_id": str(session.id),
            "started_at": session.started_at,
            "messages": [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]
        })

    return {"sessions": history}
