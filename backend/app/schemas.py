from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum

class HealthResponse(BaseModel):
    status: str
    timestamp: str

class DebugConfigResponse(BaseModel):
    llm_provider: str
    mcp_transport: str

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    pass

class UserLogin(BaseModel):
    username: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    title: str

class ReportCreate(ReportBase):
    user_id: int

class Report(ReportBase):
    # Core identification
    id: int
    user_id: int

    # Report metadata
    report_type: Optional[str] = None
    status: str

    # Generation metadata
    llm_provider: Optional[str] = None
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None
    generation_time: Optional[float] = None

    # Report content and structure
    form_selections: Optional[Dict[str, Any]] = None
    blueprint: Optional[Dict[str, Any]] = None
    prompt_used: Optional[str] = None
    generated_content: Optional[str] = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    # Error handling
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

# Blueprint Schemas
class ReportTypeEnum(str, Enum):
    COMPETITOR_ANALYSIS = "competitor_analysis"
    BUSINESS_PERFORMANCE = "business_performance"
    NEW_PARTNERS = "new_partners"
    MARKET_TRENDS = "market_trends"
    PRODUCT_LAUNCH = "product_launch"

class SectionTypeEnum(str, Enum):
    TITLE = "title"
    SUBTITLE = "subtitle"
    SECTION = "section"
    PARAGRAPH = "paragraph"
    IMAGE_PLACEHOLDER = "image_placeholder"
    TABLE_PLACEHOLDER = "table_placeholder"

class SectionMetadata(BaseModel):
    dataSource: Optional[str] = None
    analysisType: Optional[str] = None
    visualizationType: Optional[str] = None
    estimatedLength: Optional[str] = None

class BlueprintSection(BaseModel):
    id: str
    type: SectionTypeEnum
    content: str
    order: int
    parentId: Optional[str] = None
    metadata: SectionMetadata

class Blueprint(BaseModel):
    reportTitle: str
    sections: list[BlueprintSection]
    generatedAt: str
    reportType: ReportTypeEnum

class BlueprintGenerationRequest(BaseModel):
    reportType: ReportTypeEnum
    analysisSubject: str
    selectedDataPoints: list[str]
    additionalNotes: Optional[str] = ""

class BlueprintGenerationResponse(BaseModel):
    blueprint: Blueprint
    success: bool
    error: Optional[str] = None

class ReportGenerationRequest(BaseModel):
    user_id: int
    blueprint: Blueprint
    form_selections: Dict[str, Any]  # Contains selectedDataPoints, additionalNotes, etc.

class ReportGenerationResponse(BaseModel):
    report_id: int
    status: str
    message: str
