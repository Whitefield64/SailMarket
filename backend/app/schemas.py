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

class ReportWithContent(Report):
    generated_content: Optional[list] = []

class ContentTypeEnum(str, Enum):
    BLOG = "blog"
    SOCIAL = "social"
    EMAIL = "email"
    AD_COPY = "ad_copy"
    LANDING_PAGE = "landing_page"

class ContentToneEnum(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    FORMAL = "formal"
    HUMOROUS = "humorous"
    URGENT = "urgent"

class ContentGenerationRequest(BaseModel):
    content_type: ContentTypeEnum = Field(..., description="Type of content to generate")
    topic: str = Field(..., min_length=1, max_length=500, description="Topic or subject of the content")
    tone: ContentToneEnum = Field(..., description="Tone of the content")
    length: int = Field(..., ge=50, le=5000, description="Desired length in words")
    additional_context: Optional[str] = Field(None, max_length=2000, description="Additional context or requirements")
    user_id: Optional[int] = Field(None, description="User ID for associating content with user")

class ContentGenerationResponse(BaseModel):
    id: int
    content_type: str
    topic: str
    tone: str
    length: int
    generated_text: str
    llm_provider: str
    model_used: str
    tokens_used: Optional[int]
    generation_time: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class GeneratedContentList(BaseModel):
    items: list[ContentGenerationResponse]
    total: int

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
    selectedDataPoints: list[str]
    additionalNotes: Optional[str] = ""

class BlueprintGenerationResponse(BaseModel):
    blueprint: Blueprint
    success: bool
    error: Optional[str] = None
