# 🔍 PostgreSQL Container Error - Debug Guide

## 🚨 Issue Identified
```
✘ Container smart-taxi-postgres-django  Error (Exit Code 3)
```

## 🔧 Quick Fix Steps

### Step 1: Check PostgreSQL Container Logs
```bash
# Get detailed error information
docker compose -f docker-compose-django.yml logs postgres
```

### Step 2: Common Solutions

#### Option A: Port Conflict
```bash
# Check if another PostgreSQL is running
ps aux | grep postgres
sudo netstat -tulpn | grep 5432

# If conflict, stop other PostgreSQL or change port in docker-compose-django.yml
# Change "5432:5432" to "5433:5432" in the postgres service section
```

#### Option B: Permission Issues
```bash
# Remove volumes and restart
docker compose -f docker-compose-django.yml down -v
docker compose -f docker-compose-django.yml up -d
```

#### Option C: Missing PostgreSQL Volume Permissions
```bash
# Fix volume permissions
sudo chown -R 999:999 postgres_data
# Or change volume to use host machine
```

#### Option D: Database File Corruption
```bash
# Clean start
docker compose -f docker-compose-django.yml down -v
docker system prune -f
docker compose -f docker-compose-django.yml up -d
```

### Step 3: Alternative Database Configuration

If issues persist, try this alternative PostgreSQL config in `docker-compose-django.yml`:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: smart-taxi-postgres-django
  environment:
    POSTGRES_DB: smart_taxi_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres123
    POSTGRES_INITDB_ARGS: "--auth-local=trust --auth-host=trust"
  ports:
    - "5433:5432"  # Changed port
  volumes:
    - postgres_data_new:/var/lib/postgresql/data
    - ./database/setup.sql:/docker-entrypoint-initdb.d/01-setup.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d smart_taxi_db"]
    interval: 10s
    timeout: 5s
    retries: 5
  restart: unless-stopped
  user: "999:999"  # Explicit user
  command: postgres -c "max_connections=100" -c "shared_buffers=256MB" -c "work_mem=4MB"
```

### Step 4: Test After Fixes
```bash
# Check all containers are healthy
docker compose -f docker-compose-django.yml ps

# Test database connectivity
docker exec -it smart-taxi-postgres-django psql -U postgres -d smart_taxi_db -c "SELECT version();"

# Test application endpoints
curl http://localhost:8001/api/health/
curl http://localhost:8000/api/health/
```

### Step 5: If All Else Fails
```bash
# Complete reset
docker compose -f docker-compose-django.yml down -v
docker system prune -af
docker compose -f docker-compose-django.yml build --no-cache
docker compose -f docker-compose-django.yml up -d
```

## 🎯 Expected Result
After fixes, you should see:
```
✔ Container smart-taxi-postgres-django    Healthy
✔ Container smart-taxi-redis-django       Healthy  
✔ Container smart-taxi-user-service-django  Healthy
✔ Container smart-taxi-api-gateway-django   Healthy
```

Run the debug commands above and let me know what you see in the logs!