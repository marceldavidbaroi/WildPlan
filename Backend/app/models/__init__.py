from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class TripPreference(Base):
    __tablename__ = "trip_preferences"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uid = Column(String, nullable=False)
    location = Column(String)
    mood = Column(String)
    style = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True)
    uid = Column(String, nullable=False)
    trip_pref_id = Column(UUID(as_uuid=True), ForeignKey("trip_preferences.id"))
    started_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String, nullable=False)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
