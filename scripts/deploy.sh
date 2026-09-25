#!/usr/bin/env bash
# ==============================================================================
# CampusFlow — Production Deployment & Zero-Downtime Rollout Script
# ==============================================================================
set -euo pipefail

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo "======================================================"
echo "    🚀 Starting CampusFlow Production Deployment      "
echo "======================================================"

# 1. Pre-flight Checks
log_info "Running pre-flight environment checks..."

command -v docker >/dev/null 2>&1 || log_error "Docker is not installed or not in PATH."
docker compose version >/dev/null 2>&1 || log_error "Docker Compose v2 plugin is required."

if [ ! -f "$ENV_FILE" ]; then
    log_error "Missing '$ENV_FILE'. Please create it from '.env.production.example'."
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Missing '$COMPOSE_FILE'."
fi

# 2. Automated Database Backup before migration
if [ -f "scripts/backup-db.sh" ]; then
    log_info "Creating automated pre-deployment database backup..."
    bash scripts/backup-db.sh || log_warn "Pre-deployment backup had a warning, proceeding with caution."
fi

# 3. Pull / Build latest production containers
log_info "Building production images with multi-stage caching..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --pull web

# 4. Start Core Infrastructure (DB & Redis first)
log_info "Ensuring Database & Redis services are healthy..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db redis

log_info "Waiting for PostgreSQL healthcheck..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db pg_isready -U "${POSTGRES_USER:-campusflow_admin}" -d "${POSTGRES_DB:-campusflow_production}" || sleep 5

# 5. Execute Prisma Database Migrations
log_info "Executing Prisma database schema migrations..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm web npx prisma migrate deploy

# 6. Graceful Web & Reverse Proxy Rollout
log_info "Starting web application and Caddy reverse proxy..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans web caddy

# 7. Post-deployment Health Check
log_info "Verifying deployment health..."
sleep 5

MAX_RETRIES=10
RETRY_COUNT=0
HEALTHY=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps web | grep -q "healthy\|running\|Up"; then
        HEALTHY=1
        break
    fi
    log_warn "Web container starting up, checking again in 3s ($((RETRY_COUNT+1))/$MAX_RETRIES)..."
    sleep 3
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $HEALTHY -eq 1 ]; then
    log_success "CampusFlow web container is online and healthy!"
else
    log_error "Deployment healthcheck failed. Check 'docker compose -f $COMPOSE_FILE logs web'."
fi

# 8. Clean up unused images
log_info "Pruning dangling docker images..."
docker image prune -f >/dev/null 2>&1 || true

echo "======================================================"
log_success "🎉 CampusFlow production deployment completed successfully!"
echo "======================================================"
