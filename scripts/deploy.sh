#!/bin/bash
# ============================================
# Deployment Script - Smart Inter-Wilaya Taxi v2
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="smart-taxi"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${REGISTRY}/${APP_NAME}:${VERSION}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_dependencies() {
    log_info "Checking dependencies..."
    
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose is required but not installed."; exit 1; }
    
    log_info "All dependencies are installed."
}

check_environment() {
    log_info "Checking environment variables..."
    
    required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set."
            exit 1
        fi
    done
    
    log_info "All required environment variables are set."
}

# Build and push Docker image
build_image() {
    log_info "Building Docker image: ${IMAGE_NAME}"
    
    docker build \
        --build-arg NODE_ENV=production \
        --build-arg VERSION=${VERSION} \
        -t ${IMAGE_NAME} \
        -t ${REGISTRY}/${APP_NAME}:latest \
        .
    
    log_info "Docker image built successfully."
}

push_image() {
    log_info "Pushing Docker image to registry..."
    
    docker push ${IMAGE_NAME}
    docker push ${REGISTRY}/${APP_NAME}:latest
    
    log_info "Docker image pushed successfully."
}

# Deployment
deploy() {
    log_info "Deploying to ${DEPLOY_ENV}..."
    
    # Pull latest images
    docker-compose pull
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Start new containers
    docker-compose up -d
    
    # Wait for health check
    log_info "Waiting for application to be healthy..."
    sleep 30
    
    # Check if app is running
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application is healthy!"
    else
        log_error "Application health check failed!"
        docker-compose logs --tail=100
        exit 1
    fi
    
    log_info "Deployment completed successfully!"
}

# Rollback
rollback() {
    log_warn "Rolling back to previous version..."
    
    docker-compose down
    docker tag ${REGISTRY}/${APP_NAME}:previous ${REGISTRY}/${APP_NAME}:current
    docker-compose up -d
    
    log_info "Rollback completed."
}

# Database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    docker-compose exec app npx prisma migrate deploy
    
    log_info "Database migrations completed."
}

# Cleanup
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    docker image prune -f --filter "until=168h"
    
    log_info "Cleanup completed."
}

# Main
main() {
    local action=${1:-deploy}
    
    case $action in
        build)
            check_dependencies
            build_image
            ;;
        push)
            push_image
            ;;
        deploy)
            check_dependencies
            check_environment
            deploy
            ;;
        rollback)
            rollback
            ;;
        migrate)
            run_migrations
            ;;
        cleanup)
            cleanup
            ;;
        all)
            check_dependencies
            check_environment
            build_image
            push_image
            deploy
            run_migrations
            cleanup
            ;;
        *)
            echo "Usage: $0 {build|push|deploy|rollback|migrate|cleanup|all}"
            exit 1
            ;;
    esac
}

main "$@"
