#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# PostgreSQL Restore Script for DiversIA (Issue #87)
#
# Usage:
#   ./scripts/restore-postgres.sh /var/backups/diversia/diversia_20260309.sql.gz
#   ./scripts/restore-postgres.sh --list     # List available backups
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-diversia}"
DB_USER="${POSTGRES_USER:-diversia}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/diversia}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

list_backups() {
    log "Available backups in ${BACKUP_DIR}:"
    echo ""
    if [[ -d "$BACKUP_DIR" ]]; then
        ls -lh "${BACKUP_DIR}"/diversia_*.sql.gz 2>/dev/null || echo "  No backups found"
    else
        echo "  Backup directory does not exist: ${BACKUP_DIR}"
    fi
}

restore_backup() {
    local backup_file="$1"

    if [[ ! -f "$backup_file" ]]; then
        log "ERROR: File not found: ${backup_file}"
        exit 1
    fi

    log "═══════════════════════════════════════════════"
    log "DiversIA PostgreSQL Restore"
    log "═══════════════════════════════════════════════"
    log ""
    log "WARNING: This will OVERWRITE the current database!"
    log "Database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
    log "Backup:   ${backup_file}"
    log ""

    read -rp "Are you sure you want to proceed? (type YES to confirm): " confirm
    if [[ "$confirm" != "YES" ]]; then
        log "Restore cancelled"
        exit 0
    fi

    log "Restoring from: ${backup_file}"

    # Decompress and restore
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | pg_restore \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --clean \
            --if-exists \
            --verbose \
            2>&1 | while read -r line; do log "  pg_restore: $line"; done
    else
        pg_restore \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --clean \
            --if-exists \
            --verbose \
            --file="$backup_file" \
            2>&1 | while read -r line; do log "  pg_restore: $line"; done
    fi

    log "Restore completed successfully"
    log "═══════════════════════════════════════════════"
}

# ─── Main ────────────────────────────────────────────────────────────────────

if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    echo "       $0 --list"
    exit 1
fi

case "$1" in
    --list)
        list_backups
        ;;
    --help)
        echo "Usage: $0 <backup-file.sql.gz>"
        echo "       $0 --list"
        ;;
    *)
        restore_backup "$1"
        ;;
esac
