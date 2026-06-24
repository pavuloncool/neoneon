#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_ROOT="${PROJECT_ROOT}/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/supabase_${TIMESTAMP}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI is required." >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  cat >&2 <<'EOF'
Set SUPABASE_DB_URL to the direct Postgres connection string before running.
Example:
  export SUPABASE_DB_URL='postgresql://postgres:<PASSWORD>@db.krclgciodoxczlkcrhkw.supabase.co:5432/postgres?sslmode=require'
EOF
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

ROLES_FILE="${BACKUP_DIR}/roles.sql"
SCHEMA_FILE="${BACKUP_DIR}/schema.sql"
DATA_FILE="${BACKUP_DIR}/data.sql"
MANIFEST_FILE="${BACKUP_DIR}/manifest.txt"

for path in "${ROLES_FILE}" "${SCHEMA_FILE}" "${DATA_FILE}" "${MANIFEST_FILE}"; do
  if [[ -e "${path}" ]]; then
    echo "Refusing to overwrite existing file: ${path}" >&2
    exit 1
  fi
done

echo "Preparing dry-run export plan..."
supabase db dump --db-url "${SUPABASE_DB_URL}" --dry-run >/dev/null

echo "Exporting roles..."
supabase db dump --db-url "${SUPABASE_DB_URL}" --role-only -f "${ROLES_FILE}"

echo "Exporting schema..."
supabase db dump --db-url "${SUPABASE_DB_URL}" -f "${SCHEMA_FILE}"

echo "Exporting data..."
supabase db dump --db-url "${SUPABASE_DB_URL}" --data-only --use-copy -f "${DATA_FILE}"

for path in "${ROLES_FILE}" "${SCHEMA_FILE}" "${DATA_FILE}"; do
  if [[ ! -s "${path}" ]]; then
    echo "Backup file is empty: ${path}" >&2
    exit 1
  fi
done

{
  echo "created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "project_ref=krclgciodoxczlkcrhkw"
  echo "database_host=db.krclgciodoxczlkcrhkw.supabase.co"
  echo "backup_dir=${BACKUP_DIR}"
  echo "roles_file=${ROLES_FILE}"
  echo "schema_file=${SCHEMA_FILE}"
  echo "data_file=${DATA_FILE}"
  echo "validation=not_run"
  echo "validation_reason=pg_dump_and_psql_tools_unavailable_in_current_environment"
} > "${MANIFEST_FILE}"

cat <<EOF
Backup prepared successfully:
  ${BACKUP_DIR}

Files:
  ${ROLES_FILE}
  ${SCHEMA_FILE}
  ${DATA_FILE}
  ${MANIFEST_FILE}

This export is read-only and does not modify the remote database.
Full restore validation was not run in this environment because psql tooling is unavailable.
EOF
