from datetime import datetime
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import (
    HealthResponse,
    DebugConfigResponse,
    User as UserSchema,
    UserCreate,
    UserLogin,
    Report as ReportSchema,
    ReportCreate,
    BlueprintGenerationRequest,
    BlueprintGenerationResponse,
    Blueprint,
    BlueprintSection,
    SectionMetadata,
    ReportGenerationRequest,
    ReportGenerationResponse
)
from app.config import settings
from app.database import get_db
from app.models import User, Report
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
            title=report_data.title
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


# Blueprint Generation Endpoint
@router.post("/blueprint/generate", response_model=BlueprintGenerationResponse)
async def generate_blueprint(
    request: BlueprintGenerationRequest,
    db: Session = Depends(get_db)
) -> BlueprintGenerationResponse:
    """
    Generate a report blueprint structure using LLM based on user selections.
    """
    try:
        logger.info(f"Generating blueprint for report type: {request.reportType}")

        # Build the prompt for LLM
        prompt = _build_blueprint_prompt(request)
        system_prompt = _build_blueprint_system_prompt()

        # Call LLM to generate blueprint
        start_time = time.time()
        result = await call_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=4000,
            temperature=0.7
        )
        generation_time = time.time() - start_time

        logger.info(f"Blueprint generated in {generation_time:.2f}s using {result.get('provider')}")

        # Parse the LLM response (expecting JSON)
        import json
        try:
            blueprint_data = json.loads(result['content'])
        except json.JSONDecodeError:
            # If not valid JSON, try to extract JSON from markdown code blocks
            content = result['content']
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            blueprint_data = json.loads(content)

        # Map invalid section types to valid ones
        def normalize_section_type(section_type: str) -> str:
            """Normalize section types to valid enum values."""
            type_mapping = {
                'subsection': 'section',
                'sub-section': 'section',
                'heading': 'section',
                'subheading': 'subtitle',
                'sub-heading': 'subtitle',
                'text': 'paragraph',
                'body': 'paragraph',
                'image': 'image_placeholder',
                'chart': 'image_placeholder',
                'graph': 'image_placeholder',
                'visualization': 'image_placeholder',
                'table': 'table_placeholder',
                'data_table': 'table_placeholder',
            }

            normalized = section_type.lower().strip()
            return type_mapping.get(normalized, normalized)

        # Validate and create Blueprint object
        blueprint = Blueprint(
            reportTitle=blueprint_data.get('reportTitle', f"{request.reportType.value.replace('_', ' ').title()} Report"),
            sections=[
                BlueprintSection(
                    id=section.get('id', f"section_{i}"),
                    type=normalize_section_type(section.get('type', 'paragraph')),
                    content=section.get('content', ''),
                    order=section.get('order', i),
                    parentId=section.get('parentId'),
                    metadata=SectionMetadata(**section.get('metadata', {}))
                )
                for i, section in enumerate(blueprint_data.get('sections', []))
            ],
            generatedAt=datetime.now().isoformat(),
            reportType=request.reportType
        )

        return BlueprintGenerationResponse(
            blueprint=blueprint,
            success=True
        )

    except LLMRateLimitError as e:
        logger.error(f"Rate limit error: {str(e)}")
        raise HTTPException(status_code=429, detail=str(e))
    except LLMAPIError as e:
        logger.error(f"LLM API error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {str(e)}")
    except Exception as e:
        logger.error(f"Blueprint generation error: {str(e)}")
        return BlueprintGenerationResponse(
            blueprint=None,
            success=False,
            error=str(e)
        )


def _build_blueprint_prompt(request: BlueprintGenerationRequest) -> str:
    """Build the prompt for blueprint generation."""
    data_points_str = "\n".join(f"- {dp}" for dp in request.selectedDataPoints)

    report_type_label = request.reportType.value.replace('_', ' ').title()

    prompt = f"""You are a professional report structure architect. Based on the user's selections, create a detailed report blueprint.

USER SELECTIONS:
- Report Type: {report_type_label}
- Selected Data Points:
{data_points_str}
- Additional Notes: {request.additionalNotes if request.additionalNotes else 'None'}

TASK: Generate a comprehensive report structure in JSON format with the following schema:

{{
  "reportTitle": "string - compelling title for the report",
  "sections": [
    {{
      "id": "unique-id-string",
      "type": "MUST BE ONE OF: title, subtitle, section, paragraph, image_placeholder, table_placeholder",
      "content": "string - brief description of what goes here",
      "order": number,
      "parentId": "string|null - for hierarchical structure",
      "metadata": {{
        "dataSource": "string - where to get this data",
        "analysisType": "string - what kind of analysis",
        "visualizationType": "string - for images/charts",
        "estimatedLength": "string - estimated word count or size"
      }}
    }}
  ]
}}

VALID SECTION TYPES (use ONLY these):
- "title" - Main report title
- "subtitle" - Section subtitles
- "section" - Major sections (use for all headings and subsections)
- "paragraph" - Body text content
- "image_placeholder" - For charts, graphs, visualizations
- "table_placeholder" - For data tables

RULES:
1. Start with a main title (type: "title")
2. Include an executive summary section (type: "section" with child paragraphs)
3. Organize data points into logical sections (type: "section" for ALL headings, no other heading types)
4. For each data point selected, create appropriate paragraphs AND suggest relevant visualizations (images/charts)
5. Use descriptive content that guides the LLM on what to write
6. Maintain logical flow and hierarchy using parentId
7. End with conclusions/recommendations section
8. Include at least 3-5 image_placeholder or table_placeholder sections for data visualization
9. Ensure order numbers are sequential and logical

Generate a professional, comprehensive structure that would result in a thorough {report_type_label} report.

Return ONLY valid JSON, no markdown formatting or additional text."""

    return prompt


def _build_blueprint_system_prompt() -> str:
    """Build the system prompt for blueprint generation."""
    return """You are an expert business analyst and report architect. Your role is to create well-structured,
comprehensive report blueprints that organize information logically and include appropriate data visualizations.
You have deep expertise in market research, competitive analysis, business performance metrics, and strategic planning.

When creating report structures:
- Think hierarchically and organize information from high-level summaries to detailed analysis
- Balance text content with visual elements (charts, tables, diagrams)
- Include actionable insights and recommendations
- Consider the target audience and their needs
- Ensure the structure flows logically from problem/context to analysis to conclusions

Always return valid JSON that matches the requested schema exactly."""


# Report Generation Endpoint
@router.post("/reports/generate", response_model=ReportGenerationResponse)
async def generate_report_from_blueprint(
    request: ReportGenerationRequest,
    db: Session = Depends(get_db)
) -> ReportGenerationResponse:
    """
    Generate a complete report from a blueprint structure.

    This endpoint:
    1. Creates a database record with status 'processing'
    2. Converts blueprint to prompt
    3. Calls LLM to generate content
    4. Updates database with generated content
    """
    try:
        logger.info(f"Starting report generation for user: {request.user_id}")

        # Verify user exists
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Step 1: Create database record with status 'processing'
        new_report = Report(
            user_id=request.user_id,
            title=request.blueprint.reportTitle,
            status="processing",
            report_type=request.blueprint.reportType.value,
            blueprint=request.blueprint.dict(),
            form_selections=request.form_selections
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        logger.info(f"Created report record with ID: {new_report.id}")

        # Step 2: Convert blueprint to prompt
        prompt = blueprint_to_prompt_internal(request.blueprint)

        # Store the prompt used
        new_report.prompt_used = prompt
        db.commit()

        logger.info(f"Generated prompt for report (length: {len(prompt)} chars)")

        # Step 3: Call LLM to generate content
        system_prompt = _build_report_generation_system_prompt()

        start_time = time.time()
        try:
            result = await call_llm(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=8000,  # Long-form content
                temperature=0.7
            )
            generation_time = time.time() - start_time

            # Step 4: Update database with generated content
            new_report.generated_content = result['content']
            new_report.status = "completed"
            new_report.llm_provider = result.get('provider')
            new_report.model_used = result.get('model')
            new_report.tokens_used = result.get('tokens_used')
            new_report.generation_time = generation_time

            db.commit()
            db.refresh(new_report)

            logger.info(f"Report {new_report.id} generated successfully in {generation_time:.2f}s")

            return ReportGenerationResponse(
                report_id=new_report.id,
                status="completed",
                message="Report generated successfully"
            )

        except (LLMError, LLMRateLimitError, LLMAPIError) as e:
            # Update report status to failed
            new_report.status = "failed"
            new_report.error_message = str(e)
            db.commit()

            logger.error(f"Report generation failed: {str(e)}")

            return ReportGenerationResponse(
                report_id=new_report.id,
                status="failed",
                message=f"Report generation failed: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in report generation: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


def _build_report_generation_system_prompt() -> str:
    """Build the system prompt for report content generation."""
    return """You are an expert business analyst and report writer. Your role is to generate comprehensive,
professional marketing and business reports based on structured blueprints.

Your reports should:
- Be well-researched and data-driven (use realistic example data when actual data isn't provided)
- Include clear insights and actionable recommendations
- Be professionally written with proper formatting
- Use markdown for structure (headings, lists, tables, emphasis)
- Include specific numbers, percentages, and metrics where appropriate
- Maintain objectivity while highlighting key findings
- Be thorough but concise - every section should add value

When you see placeholders for images or tables:
- For tables: Generate realistic markdown tables with relevant data
- For images: Describe what visualization should be shown (e.g., "[Chart: Bar graph showing X over Y period]")

Write in a professional business tone suitable for executive stakeholders."""


def blueprint_to_prompt_internal(blueprint: Blueprint) -> str:
    """
    Internal function to convert blueprint to prompt.
    This matches the frontend blueprintToPrompt function.
    """
    sections_hierarchy = []

    # Build hierarchy
    def build_hierarchy(parent_id=None, level=0):
        children = [s for s in blueprint.sections if s.parentId == parent_id]
        children.sort(key=lambda x: x.order)

        for idx, section in enumerate(children):
            number = ""
            if level > 0:
                number = f"{idx + 1}. "

            sections_hierarchy.append({
                "section": section,
                "level": level,
                "number": number
            })

            build_hierarchy(section.id, level + 1)

    build_hierarchy()

    # Build prompt
    prompt_parts = [
        "=" * 80,
        "REPORT GENERATION INSTRUCTIONS",
        "=" * 80,
        "",
        f"Report Title: {blueprint.reportTitle}",
        f"Report Type: {blueprint.reportType.value.replace('_', ' ').title()}",
        f"Generated At: {blueprint.generatedAt}",
        "",
        "=" * 80,
        "STRUCTURAL BLUEPRINT",
        "=" * 80,
        ""
    ]

    for item in sections_hierarchy:
        section = item["section"]
        level = item["level"]
        number = item["number"]

        indent = "  " * level
        type_badge = section.type.value.upper()

        prompt_parts.append(f"{indent}{number}[{type_badge}] {section.content}")

        if section.metadata.dataSource:
            prompt_parts.append(f"{indent}  Data Source: {section.metadata.dataSource}")
        if section.metadata.analysisType:
            prompt_parts.append(f"{indent}  Analysis: {section.metadata.analysisType}")
        if section.metadata.visualizationType:
            prompt_parts.append(f"{indent}  Visualization: {section.metadata.visualizationType}")
        if section.metadata.estimatedLength:
            prompt_parts.append(f"{indent}  Est. Length: {section.metadata.estimatedLength}")

        prompt_parts.append("")

    prompt_parts.extend([
        "=" * 80,
        "GENERATION GUIDELINES",
        "=" * 80,
        "",
        "1. Follow the structure above exactly",
        "2. Generate comprehensive, professional content for each section",
        "3. Use markdown formatting (headings, lists, tables, emphasis)",
        "4. Include realistic data and metrics where appropriate",
        "5. For image/table placeholders, create markdown tables or describe visualizations",
        "6. Maintain consistent tone and quality throughout",
        "7. Ensure logical flow between sections",
        "8. Include specific insights and actionable recommendations",
        "",
        "=" * 80
    ])

    return "\n".join(prompt_parts)
