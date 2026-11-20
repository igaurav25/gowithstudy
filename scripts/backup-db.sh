#!/usr/bin/env bash
# ==============================================================================
# GoWithStudy — Automated PostgreSQL Database Backup Script
# ==============================================================================
set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
RETENTION_DAYS="${RETENTION_DAYS:-14}" # Retain backups for 14 days

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="gowithstudy_db_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

mkdir -p "$BACKUP_DIR"

echo "[INFO] Starting database backup: ${BACKUP_FILENAME}..."

# Source environment variables if .env or .env.production exists
if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    export $(grep -v '^#' "$ENV_FILE" | xargs -d '\n')
elif [ -f ".env" ]; then
    export $(grep -v '^#' ".env" | xargs -d '\n')
fi

# 1. Direct pg_dump via DATABASE_URL if available
if [ -n "${DATABASE_URL:-}" ] && command -v pg_dump >/dev/null 2>&1; then
    echo "[INFO] Dumping directly using DATABASE_URL..."
    pg_dump "$DATABASE_URL" --clean --if-exists --no-owner --no-privileges | gzip > "$BACKUP_PATH"
# 2. Docker compose container dump
elif command -v docker >/dev/null 2>&1 && [ -f "$COMPOSE_FILE" ]; then
    DB_USER="${POSTGRES_USER:-gowithstudy_admin}"
    DB_NAME="${POSTGRES_DB:-gowithstudy_production}"

    if docker compose -f "$COMPOSE_FILE" ps db 2>/dev/null | grep -q "Up\|running"; then
        docker compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$BACKUP_PATH"
    else
        echo "[ERROR] Docker PostgreSQL container is not currently running. Cannot perform backup." >&2
        exit 1
    fi
else
    echo "[ERROR] Neither pg_dump nor active Docker container found. Cannot perform backup." >&2
    exit 1
fi

chmod 600 "$BACKUP_PATH"
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo "[SUCCESS] Backup created successfully: ${BACKUP_PATH} (Size: ${BACKUP_SIZE})"

# Retention Policy: Clean backups older than RETENTION_DAYS
echo "[INFO] Cleaning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "gowithstudy_db_*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} +
echo "[SUCCESS] Backup maintenance completed."
