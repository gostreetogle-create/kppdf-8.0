#!/bin/bash
# backup.sh — MongoDB + uploads (KPPDF 8.0)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
[[ -f "$ENV_FILE" ]] && set -a && source "$ENV_FILE" && set +a

DATA_DIR="${KPPDF_DATA_DIR:-/var/lib/kppdf80}"
DOCKER="${DOCKER_CMD:-docker}"
DATE="$(date +%Y-%m-%d_%H%M)"
BACKUP_ROOT="${DATA_DIR}/backups"

mkdir -p "$BACKUP_ROOT"

echo "=== KPPDF 8.0 backup ==="
$DOCKER exec kppdf-mongo mongodump --db kppdf --out "/tmp/dump-${DATE}"
$DOCKER cp "kppdf-mongo:/tmp/dump-${DATE}" "${BACKUP_ROOT}/mongo-${DATE}"
$DOCKER exec kppdf-mongo rm -rf "/tmp/dump-${DATE}"

if [[ -d "${DATA_DIR}/uploads" ]]; then
  cp -a "${DATA_DIR}/uploads" "${BACKUP_ROOT}/uploads-${DATE}"
fi

echo "Done: ${BACKUP_ROOT}"
