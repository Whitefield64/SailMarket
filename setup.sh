#!/bin/bash

echo "======================================"
echo "Marketing AI Agent - Setup Script"
echo "======================================"
echo ""

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "NOTE: Edit .env to add your API keys:"
    echo "  - ANTHROPIC_API_KEY"
    echo "  - OPENAI_API_KEY"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

echo "Starting Docker containers..."
docker-compose up -d

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Services starting up..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
