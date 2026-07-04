#!/usr/bin/env bash
# start.sh — bash wrapper for kppdf-8.0 local starter.
# Usage:  ./start.sh [args...]
# Example: ./start.sh --check
#          ./start.sh --no-browser

set -e

# Resolve script dir and cd there so 'node start.mjs' works regardless of CWD
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

exec node start.mjs "$@"
