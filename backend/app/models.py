from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum, Text, Float
from sqlalchemy.sql import func
import enum

from app.database import Base

class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ContentType(str, enum.Enum):
    BLOG = "blog"
    SOCIAL = "social"
    EMAIL = "email"
    AD_COPY = "ad_copy"
    LANDING_PAGE = "landing_page"

class ContentTone(str, enum.Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    FORMAL = "formal"
    HUMOROUS = "humorous"
    URGENT = "urgent"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    config = Column(JSON, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class GeneratedContent(Base):
    __tablename__ = "generated_content"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    topic = Column(String(500), nullable=False)
    tone = Column(Enum(ContentTone), nullable=False)
    length = Column(Integer, nullable=False)
    prompt = Column(Text, nullable=False)
    generated_text = Column(Text, nullable=False)
    llm_provider = Column(String(50), nullable=False)
    model_used = Column(String(100), nullable=False)
    tokens_used = Column(Integer, nullable=True)
    generation_time = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
