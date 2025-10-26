# Common Commands Reference

Quick reference for frequently used commands.

## Getting Started

```bash
# First time setup
cp .env.example .env
docker-compose up

# Or use the setup script
./setup.sh
```

## Docker Compose

### Start Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Start specific service
docker-compose up backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Service Status
```bash
# Check running services
docker-compose ps

# Check resource usage
docker stats
```

## Database Commands

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec database psql -U postgres -d marketing_ai

# Inside psql:
\dt                # List tables
\d users          # Describe users table
\d reports        # Describe reports table
SELECT * FROM users;
\q                # Quit
```

### Migrations
```bash
# Access backend container
docker-compose exec backend bash

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current migration
alembic current

# Show migration history
alembic history
```

### Database Reset
```bash
# Stop services and delete data
docker-compose down -v

# Start fresh
docker-compose up
```

## Backend Development

### Access Backend Container
```bash
docker-compose exec backend bash

# Once inside:
python main.py           # Run directly
pytest                   # Run tests (when added)
pip list                # Show installed packages
```

### Add Python Package
```bash
# 1. Edit backend/requirements.txt
# 2. Rebuild
docker-compose up --build backend
```

### Run Python Commands
```bash
# Execute Python in backend container
docker-compose exec backend python -c "from app.config import settings; print(settings.LLM_PROVIDER)"

# Run a script
docker-compose exec backend python scripts/my_script.py
```

### View Backend Logs Only
```bash
docker-compose logs -f backend | grep -i error  # Errors only
docker-compose logs -f backend | grep INFO      # Info logs only
```

## Frontend Development

### Access Frontend Container
```bash
docker-compose exec frontend sh

# Once inside:
npm list                # Show installed packages
npm run build           # Build production
```

### Add npm Package
```bash
# Install package
docker-compose exec frontend npm install <package-name>

# Or edit package.json and:
docker-compose restart frontend
```

### Frontend Build
```bash
# Development build (auto with hot reload)
docker-compose up frontend

# Production build
docker-compose exec frontend npm run build

# Start production server
docker-compose exec frontend npm start
```

### Clear Next.js Cache
```bash
docker-compose exec frontend rm -rf .next
docker-compose restart frontend
```

## Testing

### Test Health Endpoint
```bash
# Using curl
curl http://localhost:8000/api/health

# Pretty print with jq
curl http://localhost:8000/api/health | jq

# Using HTTPie (if installed)
http GET localhost:8000/api/health
```

### Test Debug Config
```bash
curl http://localhost:8000/api/debug/config | jq
```

### Test Frontend
```bash
# Open in browser
open http://localhost:3000

# Or use curl
curl http://localhost:3000
```

## Maintenance

### Rebuild Everything
```bash
# Stop, rebuild, start
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Clean Docker Resources
```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything (careful!)
docker system prune -a --volumes
```

### Update Dependencies
```bash
# Backend
# 1. Update version in backend/requirements.txt
# 2. Rebuild:
docker-compose up --build backend

# Frontend
# 1. Update version in frontend/package.json
# 2. Reinstall:
docker-compose exec frontend npm install
docker-compose restart frontend
```

## Development Workflow

### Typical Development Session
```bash
# 1. Start services
docker-compose up -d

# 2. Watch logs
docker-compose logs -f

# 3. Make changes to code (hot reload happens automatically)

# 4. If you change dependencies:
docker-compose up --build

# 5. When done:
docker-compose down
```

### Reset Development Environment
```bash
# Full reset
docker-compose down -v
rm -rf frontend/node_modules frontend/.next
docker-compose build --no-cache
docker-compose up
```

## Debugging

### Check Service Health
```bash
# Is frontend running?
curl http://localhost:3000

# Is backend running?
curl http://localhost:8000/api/health

# Is database accepting connections?
docker-compose exec database pg_isready -U postgres
```

### Common Issues

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Database won't start:**
```bash
# Check logs
docker-compose logs database

# Reset database
docker-compose down -v
docker-compose up database
```

**Frontend build fails:**
```bash
# Clear cache and rebuild
docker-compose exec frontend rm -rf .next node_modules
docker-compose down
docker-compose up --build frontend
```

**Backend won't connect to database:**
```bash
# Check network
docker network ls
docker network inspect marketing-ai-agent_marketing-ai-network

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

## Environment Variables

### View Current Variables
```bash
# Backend
docker-compose exec backend env | grep -E 'DATABASE_URL|LLM_PROVIDER'

# Frontend
docker-compose exec frontend env | grep NEXT_PUBLIC
```

### Change Variables
```bash
# 1. Edit .env file
nano .env

# 2. Restart services
docker-compose restart
```

## API Documentation

### Access Interactive Docs
```bash
# Swagger UI
open http://localhost:8000/docs

# ReDoc
open http://localhost:8000/redoc

# OpenAPI JSON
curl http://localhost:8000/openapi.json | jq
```

## Performance Monitoring

### Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats marketing-ai-backend

# Check disk usage
docker system df
```

### Database Performance
```bash
# Connect and check
docker-compose exec database psql -U postgres -d marketing_ai

# Inside psql:
SELECT * FROM pg_stat_activity;
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables;
```

## Backup and Restore

### Backup Database
```bash
# Create backup
docker-compose exec database pg_dump -U postgres marketing_ai > backup.sql

# Create backup with Docker
docker-compose exec -T database pg_dump -U postgres marketing_ai > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
# From backup file
cat backup.sql | docker-compose exec -T database psql -U postgres -d marketing_ai
```

## Quick Shortcuts

```bash
# Restart just the backend
docker-compose restart backend

# Tail backend logs
docker-compose logs -f backend

# Check all services are up
docker-compose ps | grep Up

# Follow all logs with color
docker-compose logs -f --tail=50

# Execute quick Python command
docker-compose exec backend python -c "print('Hello')"

# Execute quick SQL query
docker-compose exec database psql -U postgres -d marketing_ai -c "SELECT COUNT(*) FROM users;"
```

## Production Deployment

### Build Production Images
```bash
# Frontend
docker build -t marketing-ai-frontend:prod ./frontend

# Backend
docker build -t marketing-ai-backend:prod ./backend
```

### Run Production Mode
```bash
# Set production environment
export NODE_ENV=production

# Build frontend
docker-compose exec frontend npm run build

# Use production compose file (create one)
docker-compose -f docker-compose.prod.yml up
```

## Git Workflow

```bash
# Initialize repo (if not done)
cd marketing-ai-agent
git init
git add .
git commit -m "Initial commit: Full-stack Marketing AI Agent"

# Create .env (not committed)
cp .env.example .env

# Make changes
git add .
git commit -m "Add feature X"
git push origin main
```

## Help and Documentation

```bash
# Docker Compose help
docker-compose --help
docker-compose up --help

# Read documentation
cat README.md
cat SETUP_GUIDE.md
cat docs/architecture.md
cat docs/api-reference.md

# View project structure
cat PROJECT_STRUCTURE.md
```
