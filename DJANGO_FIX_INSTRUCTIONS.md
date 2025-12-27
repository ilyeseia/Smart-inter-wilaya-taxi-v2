# Django User Service Deployment Fix Instructions

## Issues Fixed

I've identified and fixed several critical issues that were causing the `smart-taxi-user-service-django` container to fail:

### 1. ✅ Database Schema Mismatch Fixed
- **Problem**: Database setup used `user_service` schema, but Django expects `public` schema
- **Solution**: Updated `database/setup.sql` to use public schema

### 2. ✅ Missing Database Client Tools
- **Problem**: Dockerfile was missing PostgreSQL and Redis client tools
- **Solution**: Added `postgresql-client` and `redis-tools` to system dependencies

### 3. ✅ Proper Entrypoint Script
- **Problem**: No migration or initialization logic in Docker container
- **Solution**: Created `entrypoint.sh` script that:
  - Waits for database and Redis to be ready
  - Runs Django migrations
  - Creates admin user if needed
  - Collects static files
  - Starts the application

### 4. ✅ Updated Dockerfile
- **Problem**: No proper initialization sequence
- **Solution**: Modified Dockerfile to use the new entrypoint script

## How to Test the Fix

### Step 1: Clean Up Previous Containers
```bash
# Stop and remove all containers and volumes from previous attempts
docker compose -f docker-compose-django.yml down -v
```

### Step 2: Build and Start Fresh
```bash
# Build the new images with the fixed configuration
docker compose -f docker-compose-django.yml build

# Start the services
docker compose -f docker-compose-django.yml up -d
```

### Step 3: Monitor the Startup
```bash
# Check the logs to see if startup is successful
docker compose -f docker-compose-django.yml logs user-service
```

### Step 4: Test the Health Endpoint
```bash
# Once containers are running, test the health endpoint
curl http://localhost:8001/api/health/
```

## Expected Output

### Successful Health Check Response:
```json
{
  "status": "healthy",
  "service": "user-service", 
  "version": "1.0.0",
  "timestamp": "2025-11-06T19:30:00.000Z",
  "database": "healthy",
  "cache": "healthy"
}
```

### Test Authentication Endpoints:
```bash
# Register a new user
curl -X POST http://localhost:8001/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@smarttaxi.dz",
    "password": "testpassword",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login to get JWT token
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@smarttaxi.dz",
    "password": "testpassword"
  }'
```

## Admin User Credentials

The system will automatically create an admin user:
- **Email**: `admin@smarttaxi.dz`
- **Password**: `password`

## Troubleshooting

### If Containers Still Fail:

1. **Check PostgreSQL connection**:
   ```bash
   docker compose -f docker-compose-django.yml logs postgres
   ```

2. **Check Redis connection**:
   ```bash
   docker compose -f docker-compose-django.yml logs redis
   ```

3. **Check if database is initialized**:
   ```bash
   docker exec -it smart-taxi-postgres-django psql -U postgres -d smart_taxi_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
   ```

4. **If migrations failed, manually run**:
   ```bash
   docker exec -it smart-taxi-user-service-django python manage.py migrate
   ```

### Common Issues and Solutions:

1. **Port already in use**: Stop any other services using ports 8000, 8001, 5432, 6379
2. **Permission issues**: Make sure entrypoint.sh is executable (`chmod +x entrypoint.sh`)
3. **Network issues**: Restart Docker daemon or use `docker system prune`

## Files Modified

1. **`database/setup.sql`**: Fixed schema to use public instead of user_service
2. **`django_user_service/entrypoint.sh`**: New entrypoint script for proper initialization
3. **`django_user_service/Dockerfile`**: Updated to use entrypoint script and install required tools

The deployment should now work correctly with proper database migrations, health checks, and service initialization.