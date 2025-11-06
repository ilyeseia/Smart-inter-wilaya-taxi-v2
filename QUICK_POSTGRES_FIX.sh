#!/bin/bash

# 🛠️ Quick PostgreSQL Container Fix Script
# For smart-taxi-postgres-django Error (Exit Code 3)

echo "🔍 PostgreSQL Container Debug & Fix"
echo "=================================="

# Step 1: Check current container status
echo "📊 Current container status:"
docker compose -f docker-compose-django.yml ps

echo ""
echo "🔍 Checking PostgreSQL logs:"
docker compose -f docker-compose-django.yml logs postgres

echo ""
echo "🔧 Attempting fixes..."

# Step 2: Check for port conflicts
echo "🔍 Checking for port 5432 conflicts..."
if sudo netstat -tulpn | grep -q ":5432 "; then
    echo "❌ Port 5432 is in use by another process"
    echo "💡 Solution: Change port in docker-compose-django.yml to 5433"
else
    echo "✅ Port 5432 is available"
fi

# Step 3: Try stopping and removing containers
echo ""
echo "🛑 Stopping and removing containers..."
docker compose -f docker-compose-django.yml down -v

# Step 4: Check for system resources
echo ""
echo "💻 System resources check:"
free -h
df -h

# Step 5: Check Docker resources
echo ""
echo "🐳 Docker resources:"
docker system df

# Step 6: Try clean start
echo ""
echo "🚀 Attempting clean start..."
docker compose -f docker-compose-django.yml up -d

echo ""
echo "📊 New container status:"
docker compose -f docker-compose-django.yml ps

echo ""
echo "🔍 If PostgreSQL still fails, check logs:"
echo "docker compose -f docker-compose-django.yml logs postgres"
echo ""
echo "💡 If you see port conflicts, edit docker-compose-django.yml and change:"
echo "    ports:"
echo "      - \"5433:5432\"  # instead of 5432:5432"