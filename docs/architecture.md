# Architecture Overview

## System Architecture

The Marketing AI Agent is a three-tier application consisting of a frontend, backend, and database layer, all containerized with Docker.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - App Router (React Server Components)                │ │
│  │  - TypeScript with Strict Mode                         │ │
│  │  - Tailwind CSS + shadcn/ui                           │ │
│  │  - Axios API Client                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (Port 8000)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Layer                                             │ │
│  │  - Health Check Endpoint                               │ │
│  │  - Debug Config Endpoint                               │ │
│  │  - CORS Middleware                                     │ │
│  │  - Request Logging                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Business Logic Layer                                  │ │
│  │  - LLM Provider Switching (Anthropic/OpenAI)          │ │
│  │  - MCP Tools (SSE Transport)                          │ │
│  │  - Report Generation (Future)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Layer                                            │ │
│  │  - SQLAlchemy ORM                                      │ │
│  │  - Pydantic Schemas                                    │ │
│  │  - Alembic Migrations                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ PostgreSQL Protocol (Port 5432)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Database (PostgreSQL 15)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tables:                                               │ │
│  │  - users (id, email, created_at)                      │ │
│  │  - reports (id, user_id, config, status, timestamps)  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Layer

**Technology:** Next.js 14 with App Router

**Key Features:**
- Server and Client Components for optimal performance
- TypeScript strict mode for type safety
- Tailwind CSS for styling
- shadcn/ui for pre-built accessible components
- Axios for API communication

**Structure:**
```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles and CSS variables
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── DashboardContent.tsx  # Main dashboard
└── lib/                  # Utilities
    ├── api.ts            # API client
    └── utils.ts          # Helper functions
```

### Backend Layer

**Technology:** FastAPI with Python 3.11+

**Key Features:**
- Async/await for non-blocking I/O
- Automatic OpenAPI documentation
- Pydantic validation
- Colored logging for development
- CORS enabled for frontend communication

**Structure:**
```
backend/
├── app/                   # Application code
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── routes.py         # API endpoint definitions
│   ├── database.py       # Database connection and session
│   ├── config.py         # Configuration management
│   └── llm.py            # LLM provider abstraction
├── mcp/                  # Model Context Protocol tools
│   └── tools.py          # Marketing tools (SEMrush, etc.)
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py           # Migration environment
└── main.py              # FastAPI application entry point
```

### Database Layer

**Technology:** PostgreSQL 15

**Schema:**

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    config JSON NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Data Flow

### Health Check Example

```
1. Browser → GET http://localhost:3000
2. Next.js renders page
3. DashboardContent component mounts
4. useEffect calls api.health()
5. Axios → GET http://localhost:8000/api/health
6. FastAPI middleware logs request
7. /api/health endpoint handler executes
8. Returns { status: "ok", timestamp: "..." }
9. Response logged to browser console
10. UI updates API Status card
```

## MCP Tools Architecture

**Transport:** Server-Sent Events (SSE)

The MCP (Model Context Protocol) tools are designed for marketing analytics:

1. **semrush_traffic_tool**: Fetch traffic analytics from SEMrush
2. **keyword_gap_tool**: Analyze keyword gaps between domains
3. **content_scraper_tool**: Extract content from URLs for analysis

These tools communicate with the LLM provider to generate insights and reports.

## LLM Provider Switching

The application supports multiple LLM providers through a unified interface:

```python
# Configuration
LLM_PROVIDER=anthropic  # or "openai"

# Usage
response = await call_llm(prompt, model)

# Internally routes to:
# - _call_anthropic() if provider == "anthropic"
# - _call_openai() if provider == "openai"
```

## Docker Architecture

**Network:** Bridge network for inter-service communication

**Services:**
1. **frontend** - Next.js dev server on port 3000
2. **backend** - Uvicorn ASGI server on port 8000
3. **database** - PostgreSQL on port 5432

**Volumes:**
- `postgres_data` - Persistent database storage
- Bind mounts for source code (enables hot reload)

**Health Checks:**
- Database: `pg_isready -U postgres`
- Ensures backend waits for database to be ready

## Security Considerations

**Current State:**
- CORS configured for localhost:3000 only
- No authentication implemented (future work)
- Database credentials in environment variables
- API keys managed through environment variables

**Future Improvements:**
- JWT authentication
- Rate limiting
- Input validation and sanitization
- HTTPS in production
- Secrets management (Vault, etc.)

## Scalability Considerations

**Horizontal Scaling:**
- Frontend: Easily scalable with Next.js static exports or Vercel
- Backend: Stateless design allows multiple instances behind load balancer
- Database: Can add read replicas for heavy read workloads

**Vertical Scaling:**
- Async FastAPI handles concurrent requests efficiently
- PostgreSQL connection pooling via SQLAlchemy
- Next.js server components reduce client-side load

## Development vs Production

**Development (Current):**
- Hot reload enabled
- Detailed logging
- Development servers (Uvicorn --reload, next dev)
- Local volumes for source code

**Production (Future):**
- Production builds (next build, Dockerfile multi-stage)
- Gunicorn with Uvicorn workers
- Nginx reverse proxy
- Health checks and monitoring
- Environment-specific configurations
- CDN for static assets

## Monitoring and Observability

**Current Implementation:**
- Colored console logs (backend)
- Browser console logs (frontend)
- Request/response logging middleware

**Future Implementation:**
- Structured logging (JSON)
- Log aggregation (ELK stack)
- Application metrics (Prometheus)
- Error tracking (Sentry)
- APM (Application Performance Monitoring)

## Technology Choices Rationale

**Next.js 14:** Modern React framework with excellent DX, App Router for better performance

**FastAPI:** High performance, async support, automatic API docs, excellent Python typing

**PostgreSQL:** Robust RDBMS with JSON support, perfect for structured + semi-structured data

**SQLAlchemy:** Industry-standard ORM with great async support

**Docker Compose:** Simplified local development, easy service orchestration

**Tailwind + shadcn/ui:** Rapid UI development with accessible components

**TypeScript:** Type safety reduces bugs, better IDE support

**Pydantic:** Runtime validation and serialization for Python
