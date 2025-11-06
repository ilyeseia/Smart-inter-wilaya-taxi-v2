#!/bin/bash
# Django Quick Start Script
# Sets up the Django microservices for the Smart Inter-Wilaya Taxi Platform

echo "🚀 Smart Inter-Wilaya Taxi - Django Quick Start"
echo "==============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Clean up any existing containers
echo -e "\n🧹 Cleaning up existing containers..."
docker-compose -f docker-compose-django.yml down -v 2>/dev/null || true

# Start services
echo -e "\n🏗️  Starting Django microservices..."
docker-compose -f docker-compose-django.yml up -d

# Wait for services to be healthy
echo -e "\n⏳ Waiting for services to start..."
sleep 15

# Check service health
echo -e "\n🔍 Checking service health..."

# Check API Gateway
echo "1. API Gateway Health:"
curl -s http://localhost:8000/api/health/ | jq '.status // "unhealthy"' 2>/dev/null || echo "❌ Not responding"

# Check User Service
echo "2. User Service Health:"
curl -s http://localhost:8001/api/health/ | jq '.status // "unhealthy"' 2>/dev/null || echo "❌ Not responding"

# Check Service Status via Gateway
echo "3. All Services Status:"
curl -s http://localhost:8000/api/services/status/ | jq '.gateway_status // "unhealthy"' 2>/dev/null || echo "❌ Not responding"

echo -e "\n🎉 Quick Start Complete!"
echo "========================"
echo "Services are now running:"
echo "• API Gateway: http://localhost:8000"
echo "• User Service: http://localhost:8001"
echo "• Database: localhost:5432"
echo "• Redis: localhost:6379"
echo -e "\n📖 Next steps:"
echo "1. Run the migration test: ./test_django_migration.sh"
echo "2. View the documentation: cat DJANGO_MIGRATION_README.md"
echo "3. Access Django admin (after migrations): http://localhost:8001/admin/"
echo -e "\n🛑 To stop services: docker-compose -f docker-compose-django.yml down"