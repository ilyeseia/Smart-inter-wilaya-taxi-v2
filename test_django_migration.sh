#!/bin/bash
# Django Migration Test Script
# Tests the migrated Django microservices

echo "🚀 Testing Django Migration - Smart Inter-Wilaya Taxi Platform"
echo "=============================================================="

# Test API Gateway Health
echo "1. Testing API Gateway Health..."
curl -s http://localhost:8000/api/health/ | jq '.' || echo "API Gateway not running"

echo -e "\n2. Testing Service Status..."
curl -s http://localhost:8000/api/services/status/ | jq '.' || echo "Service status check failed"

# Test User Service through Gateway
echo -e "\n3. Testing User Service through API Gateway..."
echo "3.1 Testing User Service Health via Gateway..."
curl -s http://localhost:8000/api/user/api/health/ | jq '.' || echo "User service not accessible via gateway"

# Test User Registration
echo -e "\n3.2 Testing User Registration via API Gateway..."
REG_RESPONSE=$(curl -s -X POST http://localhost:8000/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@smarttaxi.dz",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone_number": "+213555999999",
    "city": "Algiers",
    "wilaya": "Algiers",
    "license_number": "TEST123"
  }')

echo "Registration Response:"
echo "$REG_RESPONSE" | jq '.' || echo "Registration failed"

# Extract token for further tests
TOKEN=$(echo "$REG_RESPONSE" | jq -r '.access // empty' 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "\n3.3 Testing User Login via API Gateway..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/user/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test.user@smarttaxi.dz",
        "password": "TestPass123!"
      }')
    
    echo "Login Response:"
    echo "$LOGIN_RESPONSE" | jq '.' || echo "Login failed"
    
    # Get fresh token
    NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access // empty' 2>/dev/null)
    
    if [ -n "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
        echo -e "\n3.4 Testing User Profile via API Gateway..."
        PROFILE_RESPONSE=$(curl -s -X GET http://localhost:8000/api/user/users/me \
          -H "Authorization: Bearer $NEW_TOKEN")
        
        echo "Profile Response:"
        echo "$PROFILE_RESPONSE" | jq '.' || echo "Profile retrieval failed"
    fi
else
    echo "Skipping login and profile tests due to registration failure"
fi

# Test Direct User Service Access
echo -e "\n4. Testing Direct User Service Access..."
echo "4.1 Direct Health Check..."
curl -s http://localhost:8001/api/health/ | jq '.' || echo "User service direct access failed"

# Test Vehicle Endpoints
echo -e "\n4.2 Testing Vehicle Management..."
if [ -n "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
    curl -s -X GET http://localhost:8000/api/user/vehicles \
      -H "Authorization: Bearer $NEW_TOKEN" | jq '.' || echo "Vehicle listing failed"
else
    echo "Skipping vehicle tests due to authentication issues"
fi

echo -e "\n✅ Django Migration Testing Complete!"
echo "======================================="
echo "If all tests passed, the migration is successful!"
echo "If any tests failed, check the service logs and configuration."