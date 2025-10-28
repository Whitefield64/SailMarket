from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum, Text, Float
from sqlalchemy.sql import func
import enum

from app.database import Base

class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Report(Base):
    __tablename__ = "reports"

    # Core identification
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Report metadata
    report_type = Column(String(255), nullable=True)
    title = Column(String(200), nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)

    # Generation metadata
    llm_provider = Column(String(50), nullable=True)
    model_used = Column(String(100), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    generation_time = Column(Float, nullable=True)

    # Report content and structure
    form_selections = Column(JSON, nullable=True)
    blueprint = Column(JSON, nullable=True)
    prompt_used = Column(Text, nullable=True)
    generated_content = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Error handling
    error_message = Column(Text, nullable=True)
