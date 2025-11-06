# 🚀 GitHub Deployment Guide
## Smart Inter-Wilaya Taxi v2 - Django Microservices

This guide explains how to deploy the Django microservices project to GitHub repository "Smart-inter-wilaya-taxi-v2".

## 📋 Prerequisites

1. **GitHub Account** with access to create repositories
2. **Git** installed locally
3. **Docker** installed for testing locally
4. **Python 3.11+** for local development

## 🔧 Step 1: Create GitHub Repository

### Option A: Create via GitHub Web Interface
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name: `Smart-inter-wilaya-taxi-v2`
4. Description: `Django microservices platform for inter-city taxi drivers`
5. Set as Public or Private
6. **Do NOT** initialize with README (we already have one)
7. Click "Create repository"

### Option B: Create via GitHub CLI
```bash
# Install GitHub CLI if not installed
# Then create repository
gh repo create Smart-inter-wilaya-taxi-v2 --public --description "Django microservices platform for inter-city taxi drivers"
```

## 🔗 Step 2: Connect Local Project to GitHub

```bash
# Initialize git repository
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial Django microservices migration from Spring Boot

Features:
- Django User Service with JWT authentication
- Django API Gateway for microservices routing
- PostgreSQL database integration
- Redis caching
- Docker containerization
- Complete API documentation
- CI/CD pipeline with GitHub Actions"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/Smart-inter-wilaya-taxi-v2.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## ⚙️ Step 3: Configure GitHub Secrets

For the CI/CD pipeline to work, you need to configure GitHub secrets:

1. Go to your repository: `Smart-inter-wilaya-taxi-v2`
2. Click "Settings" tab
3. Click "Secrets and variables" in left sidebar
4. Click "Actions"
5. Click "New repository secret"

Add these secrets:

| Secret Name | Value | Description |
|-------------|--------|-------------|
| `DOCKER_USERNAME` | Your Docker Hub username | For pushing Docker images |
| `DOCKER_PASSWORD` | Your Docker Hub token or password | For Docker image publishing |
| `CODECOV_TOKEN` | Your Codecov token (optional) | For code coverage reporting |

## 🌊 Step 4: Enable GitHub Actions

1. Go to "Actions" tab in your repository
2. GitHub will detect the `.github/workflows/django-ci-cd.yml` file
3. Click "Enable workflow" if prompted
4. The CI/CD pipeline will run automatically on your next push

## 📦 Step 5: Docker Image Publishing

The GitHub Actions workflow will automatically:
1. **Test** both Django services on every push
2. **Run security scans** with safety and bandit
3. **Build Docker images** for both services
4. **Publish to Docker Hub** (requires secrets configured)

### Manual Docker Deployment (Alternative)
```bash
# Build and run locally
docker-compose -f docker-compose-django.yml up -d

# Or build images manually
cd django_user_service
docker build -t smarttaxi/user-service:latest .

cd ../django_api_gateway
docker build -t smarttaxi/api-gateway:latest .
```

## 🚀 Step 6: Cloud Deployment Options

### Option A: Heroku Deployment
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku apps
heroku create smarttaxi-user-service
heroku create smarttaxi-api-gateway

# Add Heroku Postgres
heroku addons:create heroku-postgresql:mini -a smarttaxi-user-service

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key -a smarttaxi-user-service
heroku config:set DATABASE_URL=postgresql://... -a smarttaxi-user-service

# Deploy using Heroku Container Registry
heroku container:push web -a smarttaxi-user-service
heroku container:release web -a smarttaxi-user-service
```

### Option B: AWS ECS Deployment
```bash
# Build and push to ECR
aws ecr create-repository --repository-name smarttaxi/user-service
aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker tag smarttaxi/user-service:latest <account-id>.dkr.ecr.<region>.amazonaws.com/smarttaxi/user-service:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/smarttaxi/user-service:latest
```

### Option C: Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/smarttaxi-user-service

# Deploy to Cloud Run
gcloud run deploy smarttaxi-user-service --image gcr.io/PROJECT-ID/smarttaxi-user-service --platform managed
```

### Option D: Azure Container Instances
```bash
# Create resource group
az group create --name SmartTaxiRG --location eastus

# Deploy container
az container create --resource-group SmartTaxiRG --name smarttaxi-user-service --image smarttaxi/user-service:latest --ports 8000
```

## 🛠️ Step 7: Environment Configuration

### Production Environment Variables
Set these in your deployment platform:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=<your-super-secure-secret-key>
ALLOWED_HOSTS=yourdomain.com,your-api-gateway

# Database
DATABASE_URL=postgresql://username:password@host:port/database_name
DB_NAME=smart_taxi_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=6379

# JWT
JWT_SECRET=<your-jwt-secret-key>

# Gateway
USER_SERVICE_URL=http://your-user-service-url
```

## 📊 Step 8: Monitoring & Logging

### Health Check Endpoints
- API Gateway: `https://your-domain.com/api/health/`
- User Service: `https://your-domain.com/api/health/`

### Service Status
- Check all services: `https://your-domain.com/api/services/status/`
- List available services: `https://your-domain.com/api/services/list/`

### Logging
All services write logs to:
- Console output (for Docker/Kubernetes)
- Log files in `/app/logs/` (containerized deployments)

## 🔄 Step 9: Continuous Integration

The GitHub Actions pipeline automatically:
- ✅ Runs tests on Python 3.11
- ✅ Checks code security with `safety` and `bandit`
- ✅ Builds Docker images
- ✅ Publishes to Docker Hub (if secrets configured)
- ✅ Generates code coverage reports

### Adding More Services
To add new Django microservices:

1. Create new Django app: `django-<service-name>/`
2. Update `docker-compose-django.yml` with new service
3. Update `django_api_gateway/settings.py` with service URL
4. Test locally, then push to GitHub

## 📚 Step 10: Documentation & API Testing

### API Documentation
Access interactive API docs:
- User Service: `http://localhost:8001/admin/`
- Via Gateway: `http://localhost:8000/api/services/list/`

### Sample API Calls
```bash
# User Registration
curl -X POST http://localhost:8000/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "first_name": "John", "last_name": "Doe"}'

# User Login
curl -X POST http://localhost:8000/api/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] **GitHub Repository**: `Smart-inter-wilaya-taxi-v2` created and populated
- [ ] **GitHub Actions**: CI/CD pipeline runs successfully
- [ ] **Docker Images**: Published to Docker Hub (optional)
- [ ] **Environment Variables**: Properly configured in deployment platform
- [ ] **Health Checks**: All services return healthy status
- [ ] **API Endpoints**: Registration, login, and profile APIs work correctly
- [ ] **Database**: PostgreSQL connection established
- [ ] **Caching**: Redis connection working
- [ ] **Security**: HTTPS enabled, secrets properly managed

## 🎯 Next Steps

1. **Frontend Development**: Create Angular/Vue.js frontend
2. **Additional Services**: Group management, location tracking, chat
3. **Advanced Features**: AI assistant, payment integration
4. **Performance**: Load balancing, auto-scaling
5. **Monitoring**: Application metrics, alerting

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Verify database server is running
- Ensure security groups/firewall allow connections

**Redis Connection Failed**
- Verify REDIS_HOST and REDIS_PORT
- Check Redis server status
- Ensure proper network access

**JWT Token Issues**
- Verify JWT_SECRET is set
- Check token expiration times
- Ensure consistent secret across services

**Docker Build Failures**
- Check requirements.txt syntax
- Verify Python version compatibility
- Check available disk space

**GitHub Actions Fails**
- Review workflow logs
- Check required secrets are set
- Verify Python dependencies

## 📞 Support

For issues and support:
1. Check the logs in your deployment platform
2. Review GitHub Actions workflow logs
3. Test locally using Docker Compose
4. Check the project documentation

---

🎉 **Congratulations!** Your Django microservices platform is now ready for GitHub deployment!