#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# PostgreSQL Backup Script for DiversIA (Issue #87)
#
# Features:
# - Full database dump (pg_dump) with compression
# - Automatic rotation (keeps last N backups)
# - Optional upload to S3/Backblaze B2
# - Cron-friendly (exit codes, logging)
# - Schema-aware (auth, profiles, matching, intelligence)
#
# Usage:
#   ./scripts/backup-postgres.sh                    # Manual backup
#   ./scripts/backup-postgres.sh --upload           # Backup + upload
#   ./scripts/backup-postgres.sh --retention 30     # Keep 30 days
#
# Cron example (daily at 3 AM):
#   0 3 * * * /path/to/scripts/backup-postgres.sh --upload >> /var/log/diversia-backup.log 2>&1
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Configuration (override via environment variables) ──────────────────────

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-diversia}"
DB_USER="${POSTGRES_USER:-diversia}"
# PGPASSWORD should be set in environment or .pgpass

BACKUP_DIR="${BACKUP_DIR:-/var/backups/diversia}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
UPLOAD_ENABLED=false
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="diversia_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# S3/B2 upload settings
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-backups/postgres}"

# ─── Parse arguments ────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
    case $1 in
        --upload)
            UPLOAD_ENABLED=true
            shift
            ;;
        --retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --dir)
            BACKUP_DIR="$2"
            BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--upload] [--retention N] [--dir /path]"
            echo ""
            echo "Options:"
            echo "  --upload        Upload backup to S3/B2 after creation"
            echo "  --retention N   Keep backups for N days (default: 14)"
            echo "  --dir PATH      Backup directory (default: /var/backups/diversia)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ─── Functions ───────────────────────────────────────────────────────────────

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

check_dependencies() {
    local missing=()
    for cmd in pg_dump gzip; do
        if ! command -v "$cmd" &>/dev/null; then
            missing+=("$cmd")
        fi
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        log "ERROR: Missing required commands: ${missing[*]}"
        exit 1
    fi
}

create_backup() {
    mkdir -p "$BACKUP_DIR"

    log "Starting backup of database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}"
    log "Backup file: ${BACKUP_PATH}"

    # Dump all 4 schemas with data
    pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --format=custom \
        --compress=9 \
        --verbose \
        --schema=auth \
        --schema=profiles \
        --schema=matching \
        --schema=intelligence \
        --file="${BACKUP_PATH%.gz}" \
        2>&1 | while read -r line; do log "  pg_dump: $line"; done

    # Compress if using plain format
    if [[ -f "${BACKUP_PATH%.gz}" ]]; then
        gzip -9 "${BACKUP_PATH%.gz}"
    fi

    local size
    size=$(du -sh "$BACKUP_PATH" 2>/dev/null | cut -f1 || echo "unknown")
    log "Backup completed: ${BACKUP_FILE} (${size})"
}

rotate_backups() {
    log "Rotating backups (keeping last ${RETENTION_DAYS} days)"

    local count
    count=$(find "$BACKUP_DIR" -name "diversia_*.sql.gz" -mtime "+${RETENTION_DAYS}" -type f | wc -l)

    if [[ $count -gt 0 ]]; then
        find "$BACKUP_DIR" -name "diversia_*.sql.gz" -mtime "+${RETENTION_DAYS}" -type f -delete
        log "Deleted ${count} old backup(s)"
    else
        log "No old backups to delete"
    fi
}

upload_backup() {
    if [[ "$UPLOAD_ENABLED" != "true" ]]; then
        return
    fi

    if [[ -z "$S3_BUCKET" ]]; then
        log "WARNING: --upload requested but S3_BUCKET not set, skipping upload"
        return
    fi

    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"
    log "Uploading to ${s3_path}"

    if command -v aws &>/dev/null; then
        aws s3 cp "$BACKUP_PATH" "$s3_path" --storage-class STANDARD_IA
        log "Upload complete (AWS S3)"
    elif command -v b2 &>/dev/null; then
        b2 upload-file "$S3_BUCKET" "$BACKUP_PATH" "${S3_PREFIX}/${BACKUP_FILE}"
        log "Upload complete (Backblaze B2)"
    else
        log "ERROR: Neither 'aws' nor 'b2' CLI found, cannot upload"
        return 1
    fi
}

verify_backup() {
    if [[ ! -f "$BACKUP_PATH" ]]; then
        log "ERROR: Backup file not found: ${BACKUP_PATH}"
        return 1
    fi

    local min_size=1024  # Minimum 1KB (empty DB would be larger)
    local actual_size
    actual_size=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat -c%s "$BACKUP_PATH" 2>/dev/null || echo "0")

    if [[ $actual_size -lt $min_size ]]; then
        log "WARNING: Backup suspiciously small (${actual_size} bytes)"
        return 1
    fi

    log "Backup verified: ${actual_size} bytes"
    return 0
}

# ─── Main ────────────────────────────────────────────────────────────────────

main() {
    log "═══════════════════════════════════════════════"
    log "DiversIA PostgreSQL Backup"
    log "═══════════════════════════════════════════════"

    check_dependencies
    create_backup

    if verify_backup; then
        rotate_backups
        upload_backup
        log "Backup process completed successfully"
    else
        log "ERROR: Backup verification failed"
        exit 1
    fi

    log "═══════════════════════════════════════════════"
}

main "$@"
