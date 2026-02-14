#!/bin/bash
# ============================================
# Health Check Script
# ============================================

set -e

# Configuration
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/health}"
TIMEOUT="${TIMEOUT:-10}"
RETRIES="${RETRIES:-3}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

check_health() {
    local retry=0
    
    while [ $retry -lt $RETRIES ]; do
        if curl -sf --max-time $TIMEOUT $HEALTH_URL > /dev/null 2>&1; then
            echo -e "${GREEN}[HEALTHY]${NC} Application is healthy"
            return 0
        fi
        
        retry=$((retry + 1))
        echo "Health check attempt $retry/$RETRIES failed, retrying..."
        sleep 5
    done
    
    echo -e "${RED}[UNHEALTHY]${NC} Application is not responding"
    return 1
}

check_health
