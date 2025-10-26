# Marketing AI Agent

A full-stack AI-powered marketing analytics and reporting application built with Next.js, FastAPI, and PostgreSQL.

## Features

- Modern dashboard interface with Next.js 14 App Router
- FastAPI backend with async support
- PostgreSQL database with SQLAlchemy ORM
- Docker Compose for easy deployment
- TypeScript strict mode
- Tailwind CSS with shadcn/ui components
- Hot reload for both frontend and backend
- LLM provider switching (Anthropic/OpenAI)
- MCP tools integration ready (SSE transport)

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Axios for API calls

**Backend:**
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- Alembic migrations
- PostgreSQL
- Pydantic validation
- Colored logging

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 15

## Prerequisites

- Docker Desktop (includes Docker Compose)
- Git

That's it! No need to install Node.js, Python, or PostgreSQL locally.

## Quick Start

1. **Clone and setup**
   ```bash
   cd marketing-ai-agent
   cp .env.example .env
   ```

2. **Start the application**
   ```bash
   docker-compose up
   ```

3. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Verify It's Working

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Open browser console (F12)
3. You should see a health check response logged:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000000"
   }
   ```
4. The "API Status" card should show "✓ Online"

## Development

### View Logs

View all services:
```bash
docker-compose logs -f
```

View specific service:
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database
```

### Stop Services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

### Rebuild After Changes

```bash
docker-compose up --build
```

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Edit files in `/frontend` - changes reflect immediately
- Backend: Edit files in `/backend` - server restarts automatically

### Database Migrations

Access the backend container:
```bash
docker-compose exec backend bash
```

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

## Project Structure

```
marketing-ai-agent/
├── frontend/                 # Next.js 14 application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utilities and API client
│   └── Dockerfile
├── backend/                 # FastAPI application
│   ├── app/                # Application code
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── routes.py       # API endpoints
│   │   ├── database.py     # Database connection
│   │   ├── config.py       # Configuration
│   │   └── llm.py          # LLM provider switching
│   ├── mcp/                # MCP tools
│   │   └── tools.py        # SEMrush, keyword gap, scraper
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI app entry
│   └── Dockerfile
├── docs/                    # Documentation
├── docker-compose.yml       # Container orchestration
└── .env.example            # Environment variables template
```

## API Endpoints

### Health Check
```
GET /api/health
```

Returns backend status and timestamp.

### Debug Config
```
GET /api/debug/config
```

Returns current LLM provider and MCP transport configuration.

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `LLM_PROVIDER`: Choose between "anthropic" or "openai"
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_API_URL`: Backend URL for frontend

## Next Steps

1. **Implement Authentication**
   - Add user registration and login
   - JWT token management
   - Protected routes

2. **Connect LLM Providers**
   - Implement actual API calls in `backend/app/llm.py`
   - Add streaming support
   - Error handling and retries

3. **Implement MCP Tools**
   - SEMrush API integration
   - Keyword gap analysis
   - Content scraping functionality
   - SSE transport layer

4. **Build Report Generation**
   - Create report configuration UI
   - Implement report processing pipeline
   - Add report history and viewing

5. **Add Advanced Features**
   - Real-time updates via WebSockets
   - Export reports (PDF, CSV)
   - Scheduled reports
   - Team collaboration

## Documentation

- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Progress Log](docs/progress-log.md)

## Troubleshooting

**Port already in use:**
```bash
# Stop conflicting services or change ports in docker-compose.yml
```

**Database connection failed:**
```bash
# Ensure database service is healthy
docker-compose ps
```

**Frontend can't connect to backend:**
```bash
# Check NEXT_PUBLIC_API_URL in .env matches backend URL
```

## License

MIT
