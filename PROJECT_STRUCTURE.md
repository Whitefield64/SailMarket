# Project Structure

Complete directory tree with descriptions.

```
marketing-ai-agent/
│
├── README.md                          # Main documentation
├── SETUP_GUIDE.md                     # Quick start guide
├── PROJECT_STRUCTURE.md               # This file
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Container orchestration
├── setup.sh                           # Automated setup script
│
├── frontend/                          # Next.js 14 Application
│   ├── Dockerfile                     # Frontend container image
│   ├── package.json                   # Node dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── next.config.js                 # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── .eslintrc.json                 # ESLint rules
│   │
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout with sidebar
│   │   ├── page.tsx                   # Dashboard page (/)
│   │   └── globals.css                # Global styles + CSS variables
│   │
│   ├── components/                    # React components
│   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   ├── DashboardContent.tsx       # Main dashboard content
│   │   │
│   │   └── ui/                        # shadcn/ui components
│   │       ├── button.tsx             # Button component
│   │       └── card.tsx               # Card component
│   │
│   └── lib/                           # Utilities and helpers
│       ├── api.ts                     # API client (Axios)
│       └── utils.ts                   # Utility functions (cn, etc.)
│
├── backend/                           # FastAPI Application
│   ├── Dockerfile                     # Backend container image
│   ├── requirements.txt               # Python dependencies
│   ├── alembic.ini                    # Alembic configuration
│   ├── main.py                        # FastAPI app entry point
│   │
│   ├── app/                           # Application code
│   │   ├── __init__.py
│   │   ├── config.py                  # Settings and configuration
│   │   ├── database.py                # Database connection
│   │   ├── models.py                  # SQLAlchemy ORM models
│   │   ├── schemas.py                 # Pydantic request/response models
│   │   ├── routes.py                  # API endpoints
│   │   └── llm.py                     # LLM provider switching logic
│   │
│   ├── mcp/                           # Model Context Protocol tools
│   │   ├── __init__.py
│   │   └── tools.py                   # Marketing tools (stubs)
│   │
│   └── alembic/                       # Database migrations
│       ├── env.py                     # Alembic environment
│       ├── script.py.mako             # Migration template
│       └── versions/                  # Migration files
│           └── 001_initial_migration.py  # Initial schema
│
└── docs/                              # Documentation
    ├── architecture.md                # System architecture overview
    ├── api-reference.md               # API endpoint documentation
    └── progress-log.md                # Development progress tracking
```

## Key Files Explained

### Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates frontend, backend, and database services |
| `.env.example` | Template for environment variables |
| `frontend/tsconfig.json` | TypeScript compiler settings (strict mode) |
| `frontend/tailwind.config.ts` | Tailwind theme and plugin configuration |
| `backend/alembic.ini` | Database migration configuration |

### Entry Points

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI application initialization |
| `frontend/app/layout.tsx` | Root layout component (wraps all pages) |
| `frontend/app/page.tsx` | Home page (dashboard) |

### Core Application Logic

| File | Purpose |
|------|---------|
| `backend/app/routes.py` | API endpoint definitions |
| `backend/app/models.py` | Database schema (User, Report) |
| `backend/app/schemas.py` | Request/response validation |
| `backend/app/llm.py` | LLM provider abstraction |
| `backend/mcp/tools.py` | MCP marketing tools |
| `frontend/lib/api.ts` | API client for backend calls |
| `frontend/components/DashboardContent.tsx` | Main UI component |

### Database

| File | Purpose |
|------|---------|
| `backend/app/database.py` | SQLAlchemy engine and session |
| `backend/alembic/versions/001_*.py` | Initial migration (creates tables) |

### Styling

| File | Purpose |
|------|---------|
| `frontend/app/globals.css` | Global styles and CSS custom properties |
| `frontend/components/ui/*.tsx` | Reusable UI components (shadcn/ui) |
| `frontend/lib/utils.ts` | Utility for class name merging |

## Import Paths

### Frontend

```typescript
// Absolute imports (configured in tsconfig.json)
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
```

### Backend

```python
# Relative imports from app root
from app.models import User, Report
from app.schemas import HealthResponse
from app.config import settings
from mcp.tools import semrush_traffic_tool
```

## Adding New Files

### New Frontend Component

```bash
# Create in components/ or components/ui/
frontend/components/MyComponent.tsx
```

### New Backend Endpoint

```python
# Add to backend/app/routes.py
@router.get("/my-endpoint")
async def my_endpoint():
    return {"data": "value"}
```

### New Database Model

```python
# 1. Add to backend/app/models.py
# 2. Generate migration:
docker-compose exec backend alembic revision --autogenerate -m "add new model"
# 3. Apply migration:
docker-compose exec backend alembic upgrade head
```

### New API Route (Frontend)

```typescript
// Add to frontend/lib/api.ts
export const api = {
  // existing methods...
  myNewEndpoint: async () => {
    const response = await apiClient.get('/api/my-endpoint');
    return response.data;
  },
};
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `DashboardContent.tsx` |
| Utilities | camelCase | `api.ts`, `utils.ts` |
| Python modules | snake_case | `database.py`, `routes.py` |
| Pages (Next.js) | lowercase | `page.tsx`, `layout.tsx` |
| UI Components | PascalCase | `Button.tsx`, `Card.tsx` |
| Config files | kebab-case or lowercase | `docker-compose.yml`, `alembic.ini` |

## Hot Reload Details

**Frontend (`/frontend`):**
- Watches: `*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.css`
- Changes trigger: Fast Refresh (preserves state when possible)

**Backend (`/backend`):**
- Watches: `*.py`
- Changes trigger: Uvicorn reload (restarts server)

**Requires Rebuild:**
- `requirements.txt` changes
- `package.json` changes
- `Dockerfile` changes
- `docker-compose.yml` changes

## Size Estimates

**Initial Build:**
- Frontend image: ~350 MB (Node + dependencies)
- Backend image: ~200 MB (Python + dependencies)
- Database image: ~200 MB (PostgreSQL)
- Total: ~750 MB

**Development Volumes:**
- Source code: Bind mounted (no duplication)
- node_modules: ~200 MB
- Database data: Grows with usage

## Port Mapping

| Service | Internal | External | Purpose |
|---------|----------|----------|---------|
| Frontend | 3000 | 3000 | Next.js dev server |
| Backend | 8000 | 8000 | FastAPI application |
| Database | 5432 | 5432 | PostgreSQL |

All services are on the `marketing-ai-network` bridge network and can communicate using service names (e.g., `backend:8000`).
