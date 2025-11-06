#!/bin/bash
set -e

# Django User Service Entry Point Script
# This script handles database migrations and starts the Django application

echo "Starting Django User Service..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until redis-cli -h "${REDIS_HOST:-redis}" -p "${REDIS_PORT:-6379}" ping; do
  echo "Redis is unavailable - sleeping"
  sleep 1
done

echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist (for admin access)
echo "Setting up admin user..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
from user_service.models import UserRole
User = get_user_model()
if not User.objects.filter(email='admin@smarttaxi.dz').exists():
    admin = User.objects.create_superuser(
        email='admin@smarttaxi.dz',
        password='password',
        first_name='System',
        last_name='Administrator',
        phone_number='+213555000000',
        city='Algiers',
        wilaya='Algiers',
        license_number='ADMIN001'
    )
    UserRole.objects.create(user=admin, role='ROLE_ADMIN')
    print('Admin user created successfully')
else:
    print('Admin user already exists')
EOF

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting Gunicorn server..."
exec "$@"