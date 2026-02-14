#!/bin/sh
# ============================================
# Health Check Script for Docker
# ============================================

set -e

# Check if the app is responding
curl -f http://localhost:3000/api/health > /dev/null 2>&1

# Check the exit code
if [ $? -eq 0 ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed"
    exit 1
fi
