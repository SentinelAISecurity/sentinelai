from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String(42), unique=True, nullable=False, index=True)
    role = Column(String(20), default="developer")
    username = Column(String(100), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(String(1000), nullable=True)
    twitter = Column(String(100), nullable=True)
    github = Column(String(100), nullable=True)
    website = Column(String(500), nullable=True)
    total_audits = Column(Integer, default=0)
    total_reports = Column(Integer, default=0)
    reputation = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
