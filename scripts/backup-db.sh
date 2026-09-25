#!/usr/bin/env bash
# ==============================================================================
# CampusFlow — Automated PostgreSQL Database Backup Script
# ==============================================================================
set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
RETENTION_DAYS=14 # Keep backups for 14 days

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="campusflow_db_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

mkdir -p "$BACKUP_DIR"

echo "[INFO] Starting database backup: ${BACKUP_FILENAME}..."

# Source environment variables if .env.production exists
if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    export $(grep -v '^#' "$ENV_FILE" | xargs -d '\n')
fi

DB_USER="${POSTGRES_USER:-campusflow_admin}"
DB_NAME="${POSTGRES_DB:-campusflow_production}"

# Run pg_dump through docker container
if docker compose -f "$COMPOSE_FILE" ps db | grep -q "Up\|running"; then
    docker compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$BACKUP_PATH"
else
    # Fallback to dev docker-compose if prod isn't running
    docker compose ps db | grep -q "Up\|running" && \
        docker compose exec -T db pg_dump -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-campusflow}" --clean --if-exists | gzip > "$BACKUP_PATH" || {
            echo "[ERROR] PostgreSQL container is not currently running. Cannot perform backup." >&2
            exit 1
        }
fi

BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo "[SUCCESS] Backup created successfully: ${BACKUP_PATH} (Size: ${BACKUP_SIZE})"

# Retention Policy: Delete backups older than RETENTION_DAYS
echo "[INFO] Cleaning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "campusflow_db_*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} +
echo "[SUCCESS] Backup maintenance completed."
