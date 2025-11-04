# 🚖 Smart Inter-Wilaya Taxi Platform

A comprehensive microservices-based platform for inter-city taxi drivers enabling real-time location tracking, group-based communication, and AI-powered assistance.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular UI    │    │  API Gateway    │    │  User Service   │
│   (Frontend)    │◄──►│   (Spring Boot) │◄──►│  (Spring Boot)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │ Group Service   │
                    │ (Spring Boot)   │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │Location Service │
                    │ (Spring Boot)   │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │  Chat Service   │
                    │ (Spring Boot)   │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │AI Assistant     │
                    │ Service         │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │  PostgreSQL     │
                    │  (Multi-tenant) │
                    └─────────────────┘
```

## ✅ Currently Implemented

### 🔐 **User Service** - PRODUCTION READY
- **Location**: `user-service/`
- **Features**: 
  - User registration and authentication with JWT
  - Vehicle management
  - Role-based access control (USER, ADMIN)
  - Profile management
  - Security configuration with Spring Security
  - PostgreSQL integration
  - Docker containerized

**Key Endpoints**:
```bash
POST /api/auth/register    # User registration
POST /api/auth/login      # User authentication
GET  /api/users/{id}      # Get user profile
PUT  /api/users/{id}      # Update user profile
GET  /api/health          # Health check
```

### 🗄️ **Database Schema** - COMPLETE
- **Location**: `database/setup.sql`
- **Features**:
  - Multi-tenant architecture
  - User and vehicle management
  - Role-based security
  - Performance indexes
  - Sample data for testing

### 🐳 **Docker Configuration** - READY
- **Location**: `user-service/Dockerfile`
- **Features**:
  - Multi-stage build
  - Optimized for production
  - Java 17 runtime

## 🚀 Quick Start

### Prerequisites
```bash
- Java 17+
- PostgreSQL 13+
- Maven 3.8+
- Docker (optional)
```

### 1. Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
createdb smart_taxi_db

# Run setup script
psql -d smart_taxi_db -f database/setup.sql
```

### 2. Run User Service
```bash
# Development mode
cd user-service
mvn spring-boot:run

# Or using Docker
docker build -t smart-taxi-user-service .
docker run -p 8081:8081 smart-taxi-user-service
```

### 3. Test the API
```bash
# Register a new user
curl -X POST http://localhost:8081/user-service/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed.benali@example.com",
    "password": "SecurePass123!",
    "firstName": "Ahmed",
    "lastName": "Benali",
    "phoneNumber": "+213555123456",
    "city": "Algiers",
    "wilaya": "Algiers",
    "licenseNumber": "D123456"
  }'

# Login and get JWT token
curl -X POST http://localhost:8081/user-service/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed.benali@example.com",
    "password": "SecurePass123!"
  }'
```

## 📋 API Testing

### Sample User Registration
```json
{
  "email": "driver@example.com",
  "password": "password123",
  "firstName": "Mohamed",
  "lastName": "Kaddour",
  "phoneNumber": "+213555987654",
  "city": "Sétif",
  "wilaya": "Sétif",
  "licenseNumber": "S123789"
}
```

### Expected Response
```json
{
  "userId": 2,
  "email": "driver@example.com",
  "firstName": "Mohamed",
  "lastName": "Kaddour",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roles": ["ROLE_USER"],
  "isVerified": false,
  "isActive": true
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/smart_taxi_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=mySecretKey123456789012345678901234567890
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8081
```

### Database Configuration
Edit `user-service/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_taxi_db
spring.datasource.username=postgres
spring.datasource.password=postgres
app.jwt.secret=mySecretKey123456789012345678901234567890
app.jwt.expiration=86400000
```

## 📊 Sample Data

The database setup includes sample users:
- **Admin**: admin@smarttaxi.dz / password
- **Driver**: driver1@smarttaxi.dz / password

## 🏗️ Next Development Phases

### Phase 2: Core Services
- [ ] **Group Service**: Group management and member control
- [ ] **Location Service**: Real-time GPS tracking
- [ ] **Chat Service**: Real-time messaging

### Phase 3: Frontend & AI
- [ ] **Angular Frontend**: Google Maps integration
- [ ] **AI Assistant**: Route optimization and recommendations

### Phase 4: Deployment
- [ ] **Kubernetes**: Orchestration manifests
- [ ] **CI/CD**: Automated deployment pipeline

## 🔍 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8081/user-service/api/health

# Get user profile (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8081/user-service/api/users/1
```

### Unit Tests
```bash
cd user-service
mvn test
```

## 🛠️ Development

### Project Structure
```
smart-inter-wilaya-taxi/
├── user-service/              # ✅ Complete User Management
│   ├── src/main/java/...
│   ├── src/main/resources/...
│   ├── Dockerfile            # ✅ Docker ready
│   └── pom.xml
├── group-service/             # 🔄 In Progress
├── location-service/          # 📋 Planned
├── chat-service/             # 📋 Planned
├── ai-assistant-service/     # 📋 Planned
├── gateway-service/          # 📋 Planned
├── config-service/           # 📋 Planned
├── eureka-service/           # 📋 Planned
├── database/                 # ✅ Complete Schema
├── docker-compose.yml        # 📋 Planned
├── kubernetes/               # 📋 Planned
└── frontend/                 # 📋 Planned
```

### Adding New Features
1. Create service module with Spring Boot
2. Add entities, repositories, services, controllers
3. Configure security and database connections
4. Add API documentation
5. Create Docker and Kubernetes configs

## 📈 Production Considerations

### Security
- JWT token expiration and refresh
- HTTPS/TLS configuration
- Input validation and sanitization
- Rate limiting
- CORS configuration

### Scalability
- Horizontal scaling with load balancers
- Database connection pooling
- Caching with Redis
- Microservices communication

### Monitoring
- Application metrics
- Health checks
- Logging and tracing
- Performance monitoring

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper validation and error handling
3. Include unit tests
4. Update documentation
5. Follow security best practices

## 📞 Support

For issues and questions:
- Check the logs in `logs/user-service.log`
- Use the health endpoint for service status
- Review the API documentation

---

**Current Status**: User Service is production-ready. Other services follow the same architecture pattern.

**Next Step**: Complete Group Management Service for taxi driver group functionality.