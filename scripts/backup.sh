#!/bin/bash
# ============================================
# Database Backup Script
# ============================================

set -e

# Configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-smart_taxi}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

echo -e "${GREEN}[SUCCESS]${NC} Backup created: $BACKUP_FILE"

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
echo "Old backups cleaned."
