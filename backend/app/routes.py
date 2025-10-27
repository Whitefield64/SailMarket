from datetime import datetime
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import (
    HealthResponse,
    DebugConfigResponse,
    ContentGenerationRequest,
    ContentGenerationResponse,
    GeneratedContentList,
    User as UserSchema,
    UserCreate,
    UserLogin,
    Report as ReportSchema,
    ReportCreate,
    ReportWithContent
)
from app.config import settings
from app.database import get_db
from app.models import GeneratedContent, ContentType, ContentTone, User, Report
from app.llm import call_llm, LLMError, LLMRateLimitError, LLMAPIError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        timestamp=datetime.now().isoformat()
    )

@router.get("/debug/config", response_model=DebugConfigResponse)
async def debug_config() -> DebugConfigResponse:
    return DebugConfigResponse(
        llm_provider=settings.LLM_PROVIDER,
        mcp_transport=settings.MCP_TRANSPORT
    )

@router.post("/generate-content", response_model=ContentGenerationResponse)
async def generate_content(
    request: ContentGenerationRequest,
    db: Session = Depends(get_db)
) -> ContentGenerationResponse:
    """
    Generate marketing content using the configured LLM provider.

    Args:
        request: Content generation parameters
        db: Database session

    Returns:
        Generated content with metadata

    Raises:
        HTTPException: If generation fails
    """
    logger.info(f"Generating {request.content_type} content for topic: {request.topic}")

    prompt = _build_prompt(request)
    system_prompt = _build_system_prompt(request.content_type, request.tone)

    start_time = time.time()

    try:
        llm_response = await call_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=min(request.length * 2, 4096),
            temperature=0.7
        )

        generation_time = time.time() - start_time

        # Create content record with user_id if provided
        content_record = GeneratedContent(
            user_id=request.user_id,  # Now includes user_id
            content_type=ContentType[request.content_type.upper()],
            topic=request.topic,
            tone=ContentTone[request.tone.upper()],
            length=request.length,
            prompt=prompt,
            generated_text=llm_response["content"],
            llm_provider=llm_response["provider"],
            model_used=llm_response["model"],
            tokens_used=llm_response.get("tokens_used"),
            generation_time=generation_time
        )

        db.add(content_record)
        db.commit()
        db.refresh(content_record)

        logger.info(f"Content generated successfully. ID: {content_record.id}, User ID: {request.user_id}, Provider: {llm_response['provider']}")

        # Create a Report entry if user_id is provided
        if request.user_id:
            report = Report(
                user_id=request.user_id,
                title=f"{request.content_type.value.replace('_', ' ').title()} - {request.topic}",
                config={
                    "content_type": request.content_type.value,
                    "tone": request.tone.value,
                    "length": request.length,
                    "content_id": content_record.id,
                    "llm_provider": llm_response["provider"],
                    "model_used": llm_response["model"]
                },
                status="completed"
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            logger.info(f"Report created successfully. Report ID: {report.id}, Content ID: {content_record.id}")

        return ContentGenerationResponse(
            id=content_record.id,
            content_type=request.content_type.value,
            topic=content_record.topic,
            tone=request.tone.value,
            length=content_record.length,
            generated_text=content_record.generated_text,
            llm_provider=content_record.llm_provider,
            model_used=content_record.model_used,
            tokens_used=content_record.tokens_used,
            generation_time=content_record.generation_time,
            created_at=content_record.created_at
        )

    except LLMRateLimitError as e:
        logger.error(f"Rate limit error: {str(e)}")
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded: {str(e)}")
    except LLMAPIError as e:
        logger.error(f"LLM API error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {str(e)}")
    except Exception as e:
        logger.error(f"Content generation failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

@router.get("/generated-content", response_model=GeneratedContentList)
async def list_generated_content(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
) -> GeneratedContentList:
    """
    List all generated content with pagination.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of generated content
    """
    content = db.query(GeneratedContent).order_by(
        GeneratedContent.created_at.desc()
    ).offset(skip).limit(limit).all()

    total = db.query(GeneratedContent).count()

    items = [
        ContentGenerationResponse(
            id=item.id,
            content_type=item.content_type.value,
            topic=item.topic,
            tone=item.tone.value,
            length=item.length,
            generated_text=item.generated_text,
            llm_provider=item.llm_provider,
            model_used=item.model_used,
            tokens_used=item.tokens_used,
            generation_time=item.generation_time,
            created_at=item.created_at
        )
        for item in content
    ]

    return GeneratedContentList(items=items, total=total)

@router.get("/generated-content/{content_id}", response_model=ContentGenerationResponse)
async def get_generated_content(
    content_id: int,
    db: Session = Depends(get_db)
) -> ContentGenerationResponse:
    """
    Get a specific generated content by ID.

    Args:
        content_id: ID of the content
        db: Database session

    Returns:
        Generated content details
    """
    content = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return ContentGenerationResponse(
        id=content.id,
        content_type=content.content_type.value,
        topic=content.topic,
        tone=content.tone.value,
        length=content.length,
        generated_text=content.generated_text,
        llm_provider=content.llm_provider,
        model_used=content.model_used,
        tokens_used=content.tokens_used,
        generation_time=content.generation_time,
        created_at=content.created_at
    )

def _build_prompt(request: ContentGenerationRequest) -> str:
    """
    Build the LLM prompt based on the content generation request.

    Args:
        request: Content generation parameters

    Returns:
        Formatted prompt string
    """
    prompt_parts = [
        f"Write {request.content_type.value} content about: {request.topic}",
        f"Target length: approximately {request.length} words",
    ]

    if request.additional_context:
        prompt_parts.append(f"Additional context: {request.additional_context}")

    prompt_parts.extend([
        "",
        "Requirements:",
        f"- Use a {request.tone.value} tone",
        "- Make it engaging and actionable",
        "- Include a clear call-to-action if appropriate",
        "- Ensure the content is original and creative",
        "",
        "Generate the content now:"
    ])

    return "\n".join(prompt_parts)

def _build_system_prompt(content_type: str, tone: str) -> str:
    """
    Build the system prompt to provide context to the LLM.

    Args:
        content_type: Type of content to generate
        tone: Desired tone

    Returns:
        System prompt string
    """
    content_instructions = {
        "blog": "You are an expert blog writer who creates engaging, SEO-friendly blog posts.",
        "social": "You are a social media expert who creates viral, engaging social media posts.",
        "email": "You are an email marketing expert who writes compelling email campaigns.",
        "ad_copy": "You are an advertising copywriter who creates persuasive ad copy.",
        "landing_page": "You are a conversion copywriter who creates high-converting landing page content."
    }

    base_instruction = content_instructions.get(
        content_type,
        "You are a professional marketing content writer."
    )

    return f"{base_instruction} Write in a {tone} tone and ensure high quality, original content."

# User authentication endpoints
@router.post("/users/register", response_model=UserSchema)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserSchema:
    """
    Register a new user (no password required for now).

    Args:
        user_data: User registration data (username, email)
        db: Database session

    Returns:
        Created user

    Raises:
        HTTPException: If username or email already exists
    """
    logger.info(f"Registering new user: {user_data.username}")

    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        new_user = User(
            username=user_data.username,
            email=user_data.email
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"User registered successfully: {new_user.id}")
        return new_user

    except Exception as e:
        logger.error(f"User registration failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/users/login", response_model=UserSchema)
async def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
) -> UserSchema:
    """
    Simple login endpoint (no password validation for now).

    Args:
        login_data: Login credentials (just username)
        db: Database session

    Returns:
        User information

    Raises:
        HTTPException: If user not found
    """
    logger.info(f"Login attempt for user: {login_data.username}")

    user = db.query(User).filter(User.username == login_data.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"User logged in successfully: {user.id}")
    return user

@router.get("/users/me/{user_id}", response_model=UserSchema)
async def get_current_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> UserSchema:
    """
    Get current user information by user_id.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        User information

    Raises:
        HTTPException: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.get("/users/{user_id}/stats")
async def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user statistics including report counts.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        User statistics

    Raises:
        HTTPException: If user not found
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get total reports count
    total_reports = db.query(Report).filter(Report.user_id == user_id).count()

    # Get active reports count (processing or pending)
    active_reports = db.query(Report).filter(
        Report.user_id == user_id,
        Report.status.in_(["processing", "pending"])
    ).count()

    # Get completed reports count
    completed_reports = db.query(Report).filter(
        Report.user_id == user_id,
        Report.status == "completed"
    ).count()

    return {
        "total_reports": total_reports,
        "active_reports": active_reports,
        "completed_reports": completed_reports
    }

# Report management endpoints
@router.post("/reports", response_model=ReportSchema)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db)
) -> ReportSchema:
    """
    Create a new report.

    Args:
        report_data: Report creation data
        db: Database session

    Returns:
        Created report

    Raises:
        HTTPException: If user not found or creation fails
    """
    logger.info(f"Creating report for user: {report_data.user_id}")

    # Verify user exists
    user = db.query(User).filter(User.id == report_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        new_report = Report(
            user_id=report_data.user_id,
            title=report_data.title,
            config=report_data.config
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        logger.info(f"Report created successfully: {new_report.id}")
        return new_report

    except Exception as e:
        logger.error(f"Report creation failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Report creation failed: {str(e)}")

@router.get("/reports/user/{user_id}", response_model=list[ReportSchema])
async def get_user_reports(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
) -> list[ReportSchema]:
    """
    Get all reports for a specific user.

    Args:
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of user's reports

    Raises:
        HTTPException: If user not found
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reports = db.query(Report).filter(
        Report.user_id == user_id
    ).order_by(
        Report.created_at.desc()
    ).offset(skip).limit(limit).all()

    return reports

@router.get("/reports/{report_id}", response_model=ReportSchema)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db)
) -> ReportSchema:
    """
    Get a specific report by ID.

    Args:
        report_id: Report ID
        db: Database session

    Returns:
        Report details

    Raises:
        HTTPException: If report not found
    """
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return report

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a report (with ownership check).

    Args:
        report_id: Report ID
        user_id: User ID (for ownership verification)
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If report not found or user doesn't own it
    """
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Check ownership
    if report.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")

    try:
        db.delete(report)
        db.commit()
        logger.info(f"Report deleted successfully: {report_id}")
        return {"message": "Report deleted successfully"}

    except Exception as e:
        logger.error(f"Report deletion failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Report deletion failed: {str(e)}")
