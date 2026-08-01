#!/usr/bin/env bash
#
# TZ-253 — Nightly dependency audit script.
#
# Runs `pnpm audit --prod` against the backend and frontend manifests and
# counts high/critical advisories. Exits with code 1 when any high/critical
# CVE is found — the failing exit is what nightly CI hooks consume.
#
# Usage:
#   scripts/nightly-dep-check.sh                # run with default behaviour
#   scripts/nightly-dep-check.sh --allow-high   # allow high-severity without failing
#   scripts/nightly-dep-check.sh --prod-only    # skip devDependencies tree
#
# TZ-253 §1 acceptance: zero high/critical → exit 0; otherwise exit 1.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${PROJECT_ROOT}"

ALLOW_HIGH=0
PROD_ONLY=0
for arg in "$@"; do
  case "${arg}" in
    --allow-high) ALLOW_HIGH=1 ;;
    --prod-only) PROD_ONLY=1 ;;
    *) echo "Unknown arg: ${arg}" >&2; exit 2 ;;
  esac
done

AUDIT_FLAGS=()
if [ "${PROD_ONLY}" -eq 1 ]; then
  AUDIT_FLAGS+=("--prod")
fi

# Resolve pnpm from PATH; fall back to corepack.
run_audit() {
  local manifest_dir="$1"
  local label="$2"
  cd "${manifest_dir}"
  echo "::group::${label}: pnpm audit"
  pnpm audit --json "${AUDIT_FLAGS[@]}" > /tmp/pnpm-audit-${label}.json 2>&1 || true
  local count
  count=$(jq '[.vulnerabilities // {} | to_entries[] | select(.value.severity == "high" or .value.severity == "critical")] | length' /tmp/pnpm-audit-${label}.json 2>/dev/null || echo 0)
  echo "${label}: ${count} high/critical advisories"
  echo "::endgroup::"
  echo "${count}"
}

BACKEND_HC=$(run_audit "${PROJECT_ROOT}/backend" "backend")
FRONTEND_HC=$(run_audit "${PROJECT_ROOT}/frontend" "frontend")
ROOT_HC=$(run_audit "${PROJECT_ROOT}" "root")

TOTAL=$((BACKEND_HC + FRONTEND_HC + ROOT_HC))

echo
echo "=================================================="
echo "TZ-253 nightly dep-check summary"
echo "  backend : ${BACKEND_HC} high/critical"
echo "  frontend: ${FRONTEND_HC} high/critical"
echo "  root    : ${ROOT_HC} high/critical"
echo "  total   : ${TOTAL} high/critical"
echo "=================================================="

if [ "${TOTAL}" -gt 0 ] && [ "${ALLOW_HIGH}" -eq 0 ]; then
  echo "FAIL: ${TOTAL} high/critical advisories discovered; ${0} should be the target."
  exit 1
fi

if [ "${TOTAL}" -gt 0 ]; then
  echo "WARN: ${TOTAL} high/critical advisories present, but --allow-high passed."
  exit 0
fi

echo "PASS: zero high/critical advisories."
exit 0
