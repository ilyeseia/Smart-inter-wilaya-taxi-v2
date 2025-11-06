#!/bin/bash

# 🚀 Clean GitHub Deployment Script for ilyeseia
# Repository: https://github.com/ilyeseia/Smart-inter-wilaya-taxi-v2
# 
# Instructions:
# 1. This script sets up Git and prepares the repository
# 2. You'll need to manually run: git push -u origin main
# 3. Use your GitHub Personal Access Token for authentication

echo "🚀 Smart Inter-Wilaya Taxi - GitHub Deployment Setup"
echo "===================================================="
echo "Repository: https://github.com/ilyeseia/Smart-inter-wilaya-taxi-v2"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize Git if not done
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Configure Git user
echo "👤 Setting up Git user configuration..."
git config user.name "ilyeseia"
git config user.email "ilyeseia@users.noreply.github.com"

# Set up remote origin (you'll need to add your token manually)
echo "🔗 Remote repository configuration:"
echo "Repository URL: https://github.com/ilyeseia/Smart-inter-wilaya-taxi-v2"
echo "Add your GitHub token: https://ghp_[YOUR_TOKEN]@github.com/ilyeseia/Smart-inter-wilaya-taxi-v2.git"
echo ""
echo "To complete setup, run:"
echo "git remote set-url origin https://ghp_[YOUR_TOKEN]@github.com/ilyeseia/Smart-inter-wilaya-taxi-v2.git"
echo ""

# Add all files
echo "📦 Adding files to Git..."
git add .

# Check if there are any changes
if git diff --staged --quiet; then
    echo "ℹ️ No changes to commit"
else
    # Create commit
    echo "💾 Creating commit..."
    git commit -m "🚀 Smart Inter-Wilaya Taxi Platform - Django Microservices

✨ Complete Django Migration with All Fixes Applied:

🔧 Database Fixes:
- Fixed schema mismatch (public schema instead of user_service)
- PostgreSQL migrations on container startup
- Redis caching integration
- Health check endpoints

🛠️ Docker Improvements:
- New entrypoint.sh with initialization logic
- Updated Dockerfile with required tools
- Proper health checks and monitoring
- Production-ready configuration

🌐 Features:
- User management with JWT authentication
- Vehicle management with driver associations
- Role-based access control (Admin/User/Driver)
- RESTful API with comprehensive endpoints
- Database models and serializers
- Health monitoring and logging

📁 Structure:
- /django_user_service/ - User management microservice
- /django_api_gateway/ - API Gateway service
- /database/ - Database setup and schema
- Docker orchestration and deployment scripts

🆕 Documentation:
- DJANGO_FIX_INSTRUCTIONS.md - Complete troubleshooting guide
- GITHUB_DEPLOYMENT_COMPLETE.md - Deployment instructions
- GITHUB_SETUP_ILYESEIA.md - Setup guide

Ready for production deployment! 🎉"
fi

# Set main branch
echo "🌿 Setting up main branch..."
git branch -M main

echo ""
echo "✅ Git setup completed!"
echo ""
echo "🚀 To push to GitHub, run:"
echo "git push -u origin main"
echo ""
echo "You'll be prompted for your GitHub username and token."
echo "Repository: https://github.com/ilyeseia/Smart-inter-wilaya-taxi-v2"