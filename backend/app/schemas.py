from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any

class HealthResponse(BaseModel):
    status: str
    timestamp: str

class DebugConfigResponse(BaseModel):
    llm_provider: str
    mcp_transport: str

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    config: Dict[str, Any]

class ReportCreate(ReportBase):
    user_id: int

class Report(ReportBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
