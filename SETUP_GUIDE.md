# Quick Setup Guide

Get the Marketing AI Agent running in 3 simple steps.

## Prerequisites

- **Docker Desktop** installed and running
  - Download: https://www.docker.com/products/docker-desktop

That's it! No need to install Node.js, Python, or PostgreSQL.

## Setup (3 Steps)

### Step 1: Configure Environment

```bash
cp .env.example .env
```

Optional: Edit `.env` to add your API keys (not required for basic testing):
```bash
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
```

### Step 2: Start the Application

```bash
docker-compose up
```

Wait for the services to start (30-60 seconds on first run).

### Step 3: Verify It's Working

Open your browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

**Expected behavior:**
1. Dashboard loads with sidebar navigation
2. Open browser console (F12)
3. You should see: `Health check response: {status: "ok", timestamp: "..."}`
4. The "API Status" card shows "✓ Online"

## Using the Setup Script

Alternatively, use the setup script:

```bash
./setup.sh
```

## Verify Services

Check all services are running:
```bash
docker-compose ps
```

Expected output:
```
NAME                      STATUS
marketing-ai-backend      Up
marketing-ai-db          Up (healthy)
marketing-ai-frontend     Up
```

## View Logs

All services:
```bash
docker-compose logs -f
```

Specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

## Stop the Application

```bash
docker-compose down
```

To also remove database data:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 3000, 8000, or 5432 is already in use:

1. Stop conflicting services, or
2. Edit `docker-compose.yml` to use different ports

### Services Won't Start

```bash
# Rebuild containers
docker-compose up --build

# Or completely reset
docker-compose down -v
docker-compose up --build
```

### Frontend Can't Connect to Backend

Check `NEXT_PUBLIC_API_URL` in `.env` matches the backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Connection Error

Wait longer - database initialization takes time on first run. Check logs:
```bash
docker-compose logs database
```

## Next Steps

Once verified working:
1. Explore the dashboard UI
2. Check API documentation at http://localhost:8000/docs
3. Review [architecture.md](docs/architecture.md) to understand the system
4. Review [api-reference.md](docs/api-reference.md) for API details
5. Start building features!

## Development Workflow

**Hot reload is enabled:**
- Edit files in `/frontend` - changes appear immediately
- Edit files in `/backend` - server restarts automatically

**No need to restart Docker** unless you:
- Change `docker-compose.yml`
- Change `Dockerfile`
- Change `requirements.txt` or `package.json`

**Access the database:**
```bash
docker-compose exec database psql -U postgres -d marketing_ai
```

**Run backend commands:**
```bash
docker-compose exec backend bash
# Then inside container:
alembic upgrade head
python -m pytest
```

**Install new npm packages:**
```bash
docker-compose exec frontend npm install <package-name>
docker-compose restart frontend
```

**Install new Python packages:**
1. Add to `backend/requirements.txt`
2. Rebuild: `docker-compose up --build backend`

## Success Criteria

You'll know everything is working when:
- ✓ Frontend loads at localhost:3000
- ✓ Backend API docs show at localhost:8000/docs
- ✓ Browser console shows health check response
- ✓ Dashboard shows "✓ Online" status
- ✓ No error messages in docker-compose logs

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify Docker Desktop is running
3. Ensure ports 3000, 8000, 5432 are available
4. Try rebuilding: `docker-compose up --build`

Happy coding!
