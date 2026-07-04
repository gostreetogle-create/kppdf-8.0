#!/usr/bin/env bash
# kit-stack.sh — auto-detect project stack и render STACK.md из STACK-template.md
#
# Usage:
#   bash kit-stack.sh                     # auto-detect + interactive (если STACK.md есть)
#   bash kit-stack.sh --auto              # non-interactive: detect + write (или skip)
#   bash kit-stack.sh --force             # перезаписать существующий STACK.md
#   bash kit-stack.sh --stack web-spa     # форсировать стек (skip auto-detect)
#   bash kit-stack.sh --stack backend-api
#   bash kit-stack.sh --stack cli-tool
#   bash kit-stack.sh --stack fullstack
#   bash kit-stack.sh --dry-run           # показать что будет сделано, без записи
#
# Что делает:
#   1. Detect project root (родитель OrchestratorKit/)
#   2. Scan manifest-файлы (package.json, requirements.txt, go.mod, Cargo.toml, pyproject.toml, pom.xml)
#   3. Detect primary stack: web-spa / backend-api / cli-tool / fullstack / unknown
#   4. Read STACK-template.md
#   5. Process {{#IF_X}}...{{/IF_X}} blocks (delete if stack not applicable)
#   6. Replace {{PLACEHOLDER}} values with detected info
#   7. Auto-populate module map by scanning project subdirs
#   8. Write to PROJECT_ROOT/STACK.md (or skip if exists, unless --force)
#
# Exit codes:
#   0 = success (STACK.md created or already exists with --auto)
#   1 = failure (template missing, can't detect project root, etc.)
#   2 = user declined overwrite (no --force)

set -uo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"
TEMPLATE="$SCRIPT_DIR/_templates/STACK-template.md"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd || echo "")"
OUTPUT="$PROJECT_ROOT/STACK.md"

# Defaults
FORCE=0
AUTO=0
DRY_RUN=0
FORCED_STACK=""

# Parse args
for arg in "$@"; do
  case "$arg" in
    --force)     FORCE=1 ;;
    --auto)      AUTO=1 ;;
    --dry-run)   DRY_RUN=1 ;;
    --stack=*)   FORCED_STACK="${arg#--stack=}" ;;
    --stack)     shift; FORCED_STACK="${1:-}" ;;
    --help|-h)
      sed -n '2,21p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *) echo "Unknown arg: $arg (use --help)"; exit 1 ;;
  esac
done

# === Preconditions ===
if [ ! -f "$TEMPLATE" ]; then
  echo "ERROR: template not found: $TEMPLATE"
  exit 1
fi

if [ -z "$PROJECT_ROOT" ] || [ "$PROJECT_ROOT" = "/" ] || [ "$PROJECT_ROOT" = "$SCRIPT_DIR" ]; then
  echo "ERROR: cannot determine project root (expected parent of $SCRIPT_DIR)"
  exit 1
fi

echo "🔍 kit-stack: scanning $PROJECT_ROOT"
echo ""

# === STEP 1: Detect manifests ===
HAS_PACKAGE_JSON=0
HAS_REQUIREMENTS_TXT=0
HAS_PYPROJECT=0
HAS_GO_MOD=0
HAS_CARGO_TOML=0
HAS_POM_XML=0
HAS_DOCKER=0
HAS_DOCKER_COMPOSE=0
HAS_FRONTEND_DIR=0
HAS_BACKEND_DIR=0
FRONTEND_DIR=""
BACKEND_DIR=""
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

[ -f "$PROJECT_ROOT/package.json" ] && HAS_PACKAGE_JSON=1
[ -f "$PROJECT_ROOT/requirements.txt" ] && HAS_REQUIREMENTS_TXT=1
[ -f "$PROJECT_ROOT/pyproject.toml" ] && HAS_PYPROJECT=1
[ -f "$PROJECT_ROOT/go.mod" ] && HAS_GO_MOD=1
[ -f "$PROJECT_ROOT/Cargo.toml" ] && HAS_CARGO_TOML=1
[ -f "$PROJECT_ROOT/pom.xml" ] && HAS_POM_XML=1
[ -d "$PROJECT_ROOT/docker" ] && HAS_DOCKER=1
[ -f "$PROJECT_ROOT/docker-compose.yml" ] || [ -f "$PROJECT_ROOT/docker-compose.yaml" ] && HAS_DOCKER_COMPOSE=1
[ -d "$PROJECT_ROOT/frontend" ] && { HAS_FRONTEND_DIR=1; FRONTEND_DIR="frontend"; }
[ -d "$PROJECT_ROOT/web" ] && { HAS_FRONTEND_DIR=1; FRONTEND_DIR="web"; }
[ -d "$PROJECT_ROOT/client" ] && { HAS_FRONTEND_DIR=1; FRONTEND_DIR="client"; }
[ -d "$PROJECT_ROOT/app" ] && { HAS_FRONTEND_DIR=1; FRONTEND_DIR="app"; }
[ -d "$PROJECT_ROOT/backend" ] && { HAS_BACKEND_DIR=1; BACKEND_DIR="backend"; }
[ -d "$PROJECT_ROOT/server" ] && { HAS_BACKEND_DIR=1; BACKEND_DIR="server"; }
[ -d "$PROJECT_ROOT/api" ] && { HAS_BACKEND_DIR=1; BACKEND_DIR="api"; }
[ -d "$PROJECT_ROOT/src" ] && [ -z "$FRONTEND_DIR" ] && [ -z "$BACKEND_DIR" ] && FRONTEND_DIR="src" || BACKEND_DIR="src"

# Try to read project name from package.json if exists
if [ -f "$PROJECT_ROOT/package.json" ] && command -v grep >/dev/null 2>&1; then
  PJ_NAME=$(grep -oE '"name"[[:space:]]*:[[:space:]]*"[^"]+"' "$PROJECT_ROOT/package.json" 2>/dev/null | head -1 | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
  [ -n "$PJ_NAME" ] && PROJECT_NAME="$PJ_NAME"
fi

echo "📦 Detected:"
echo "  - project name: $PROJECT_NAME"
echo "  - manifests:    pkg=$HAS_PACKAGE_JSON req=$HAS_REQUIREMENTS_TXT py=$HAS_PYPROJECT go=$HAS_GO_MOD cargo=$HAS_CARGO_TOML pom=$HAS_POM_XML"
echo "  - dirs:         frontend=$FRONTEND_DIR backend=$BACKEND_DIR"
echo "  - docker:       compose=$HAS_DOCKER_COMPOSE docker-dir=$HAS_DOCKER"
echo ""

# === STEP 2: Detect stack ===
DETECTED_STACK=""

# CLI detection
if [ $HAS_GO_MOD -eq 1 ] && [ -d "$PROJECT_ROOT/cmd" ] && [ $HAS_BACKEND_DIR -eq 0 ] && [ $HAS_FRONTEND_DIR -eq 0 ]; then
  DETECTED_STACK="cli-tool"
elif [ $HAS_CARGO_TOML -eq 1 ] && [ -d "$PROJECT_ROOT/src" ] && [ ! -d "$PROJECT_ROOT/src/app" ] && [ ! -d "$PROJECT_ROOT/src/pages" ]; then
  # Cargo with no Angular/Vue/React indicators
  if ! grep -qE '"@angular|core-js|"react"|"vue"|"svelte"' "$PROJECT_ROOT/Cargo.toml" 2>/dev/null; then
    DETECTED_STACK="cli-tool"
  fi
fi
# Python CLI: pyproject.toml with click/typer/argparse + no web framework
if [ $HAS_PYPROJECT -eq 1 ] && [ $HAS_FRONTEND_DIR -eq 0 ] && [ $HAS_BACKEND_DIR -eq 0 ]; then
  if grep -qiE 'click|typer|argparse' "$PROJECT_ROOT/pyproject.toml" 2>/dev/null; then
    if ! grep -qiE 'fastapi|django|flask|starlette|aiohttp' "$PROJECT_ROOT/pyproject.toml" 2>/dev/null; then
      DETECTED_STACK="cli-tool"
    fi
  fi
fi
# Node CLI: package.json with bin field
if [ $HAS_PACKAGE_JSON -eq 1 ] && [ $HAS_FRONTEND_DIR -eq 0 ] && [ $HAS_BACKEND_DIR -eq 0 ]; then
  if grep -qE '"bin"[[:space:]]*:' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    if ! grep -qE '"@angular|"react"|"vue"|"svelte"|"@nestjs/core"|"express"|"fastify"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
      DETECTED_STACK="cli-tool"
    fi
  fi
fi

# Backend API detection
if [ -z "$DETECTED_STACK" ] && [ $HAS_PACKAGE_JSON -eq 1 ]; then
  if grep -qE '"@nestjs/core"|"express"|"fastify"|"koa"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    DETECTED_STACK="backend-api"
  fi
fi
if [ -z "$DETECTED_STACK" ] && [ $HAS_REQUIREMENTS_TXT -eq 1 ]; then
  if grep -qiE 'fastapi|django|flask|starlette|aiohttp' "$PROJECT_ROOT/requirements.txt" 2>/dev/null; then
    DETECTED_STACK="backend-api"
  fi
fi
if [ -z "$DETECTED_STACK" ] && [ $HAS_PYPROJECT -eq 1 ]; then
  if grep -qiE 'fastapi|django|flask|starlette|aiohttp' "$PROJECT_ROOT/pyproject.toml" 2>/dev/null; then
    DETECTED_STACK="backend-api"
  fi
fi
if [ -z "$DETECTED_STACK" ] && [ $HAS_GO_MOD -eq 1 ]; then
  if grep -qE 'gin-gonic|labstack/echo|go-chi' "$PROJECT_ROOT/go.mod" 2>/dev/null; then
    DETECTED_STACK="backend-api"
  fi
fi
if [ -z "$DETECTED_STACK" ] && [ $HAS_POM_XML -eq 1 ]; then
  if grep -qE 'spring-boot' "$PROJECT_ROOT/pom.xml" 2>/dev/null; then
    DETECTED_STACK="backend-api"
  fi
fi

# Web SPA detection
if [ -z "$DETECTED_STACK" ] && [ $HAS_PACKAGE_JSON -eq 1 ]; then
  if grep -qE '"@angular/core"|"react"|"vue"|"svelte"|"solid-js"|"preact"' "$PROJECT_ROOT/package.json" 2>/dev/null; then
    DETECTED_STACK="web-spa"
  fi
fi

# Fullstack: both frontend and backend dirs
if [ -z "$DETECTED_STACK" ] && [ $HAS_FRONTEND_DIR -eq 1 ] && [ $HAS_BACKEND_DIR -eq 1 ]; then
  DETECTED_STACK="fullstack"
fi
# If has package.json in frontend subdir
if [ -z "$DETECTED_STACK" ] && [ -n "$FRONTEND_DIR" ] && [ -f "$PROJECT_ROOT/$FRONTEND_DIR/package.json" ]; then
  if grep -qE '"@angular/core"|"react"|"vue"|"svelte"' "$PROJECT_ROOT/$FRONTEND_DIR/package.json" 2>/dev/null; then
    [ $HAS_BACKEND_DIR -eq 1 ] && DETECTED_STACK="fullstack" || DETECTED_STACK="web-spa"
  fi
fi

# Use forced stack if provided
if [ -n "$FORCED_STACK" ]; then
  DETECTED_STACK="$FORCED_STACK"
fi

# Default to web-spa if still nothing
if [ -z "$DETECTED_STACK" ]; then
  DETECTED_STACK="web-spa"
  if [ $AUTO -eq 0 ]; then
    echo "⚠️  Could not auto-detect stack (no recognizable manifests)."
    echo "    Defaulting to 'web-spa' template."
    echo "    Use --stack=<web-spa|backend-api|cli-tool|fullstack> to override."
    echo ""
  fi
fi

echo "🎯 Stack: $DETECTED_STACK"
echo ""

# === STEP 3: Extract specific tech for detected stack ===

# Initialize all variables to empty
FRONTEND_FRAMEWORK=""; FRONTEND_VERSION=""; FRONTEND_BUILDER=""; FRONTEND_BUILDER_VERSION=""
FRONTEND_TS_VERSION=""; FRONTEND_STYLING=""; FRONTEND_STYLING_NOTE=""; FRONTEND_TEST_RUNNER=""
FRONTEND_TEST_VERSION=""; FRONTEND_PKG_MGR=""; FRONTEND_PKG_MGR_VERSION=""; FRONTEND_STRUCTURE=""
FRONTEND_SCRIPTS=""; FRONTEND_DECISIONS=""

BACKEND_FRAMEWORK=""; BACKEND_VERSION=""; BACKEND_DB=""; BACKEND_DB_VERSION=""; BACKEND_AUTH=""
BACKEND_AUTH_VERSION=""; BACKEND_VALIDATION=""; BACKEND_VALIDATION_VERSION=""; BACKEND_TEST_RUNNER=""
BACKEND_TEST_VERSION=""; BACKEND_TS_VERSION=""; BACKEND_PKG_MGR=""; BACKEND_PKG_MGR_VERSION=""
BACKEND_STRUCTURE=""; BACKEND_SCRIPTS=""; BACKEND_DECISIONS=""

CLI_LANG=""; CLI_LANG_VERSION=""; CLI_FRAMEWORK=""; CLI_FRAMEWORK_VERSION=""; CLI_BUILDER=""
CLI_BUILDER_VERSION=""; CLI_TEST_RUNNER=""; CLI_TEST_VERSION=""; CLI_LINT=""; CLI_LINT_VERSION=""
CLI_STRUCTURE=""; CLI_SCRIPTS=""

STACK_SUMMARY=""
MANIFEST_LIST=""

# Helper: extract version from package.json
extract_pkg_version() {
  local pkg="$1"
  local pkgjson="$2"
  grep -oE "\"${pkg}\"[[:space:]]*:[[:space:]]*\"[^\"]+\"" "$pkgjson" 2>/dev/null | head -1 | sed -E "s/.*\"${pkg}\"[[:space:]]*:[[:space:]]*\"([^\"]+)\".*/\1/"
}

if [ "$DETECTED_STACK" = "web-spa" ] || [ "$DETECTED_STACK" = "fullstack" ]; then
  PKG="$PROJECT_ROOT/$FRONTEND_DIR/package.json"
  if [ -f "$PKG" ]; then
    MANIFEST_LIST="$MANIFEST_LIST$FRONTEND_DIR/package.json, "
    if grep -q '"@angular/core"' "$PKG" 2>/dev/null; then
      FRONTEND_FRAMEWORK="Angular"
      FRONTEND_VERSION=$(extract_pkg_version "@angular/core" "$PKG")
      FRONTEND_BUILDER="@angular/build"
      FRONTEND_BUILDER_VERSION=$(extract_pkg_version "@angular/build" "$PKG")
      FRONTEND_DECISIONS="- **Все компоненты standalone** (не NgModule)
- **Signals для state** (если @angular/core >= 17)
- **Новый control flow** @if/@for (Angular 17+)
- **CSS variables для темизации**"
    elif grep -q '"react"' "$PKG" 2>/dev/null; then
      FRONTEND_FRAMEWORK="React"
      FRONTEND_VERSION=$(extract_pkg_version "react" "$PKG")
      FRONTEND_BUILDER="Vite"
      FRONTEND_BUILDER_VERSION=$(extract_pkg_version "vite" "$PKG")
      FRONTEND_DECISIONS="- **Hooks** для state (useState/useReducer)
- **TypeScript strict** mode
- **React Router** для навигации"
    elif grep -q '"vue"' "$PKG" 2>/dev/null; then
      FRONTEND_FRAMEWORK="Vue"
      FRONTEND_VERSION=$(extract_pkg_version "vue" "$PKG")
      FRONTEND_BUILDER="Vite"
      FRONTEND_BUILDER_VERSION=$(extract_pkg_version "vite" "$PKG")
      FRONTEND_DECISIONS="- **Composition API** с <script setup>
- **Pinia** для state
- **TypeScript strict** mode"
    elif grep -q '"svelte"' "$PKG" 2>/dev/null; then
      FRONTEND_FRAMEWORK="Svelte"
      FRONTEND_VERSION=$(extract_pkg_version "svelte" "$PKG")
      FRONTEND_BUILDER="Vite"
      FRONTEND_BUILDER_VERSION=$(extract_pkg_version "vite" "$PKG")
      FRONTEND_DECISIONS="- **Runes** ($state, $derived) для state
- **TypeScript** strict"
    fi
    FRONTEND_TS_VERSION=$(extract_pkg_version "typescript" "$PKG")
    FRONTEND_TEST_RUNNER=$(grep -oE '"vitest"[[:space:]]*:' "$PKG" >/dev/null 2>&1 && echo "Vitest" || echo "—")
    FRONTEND_TEST_VERSION=$(extract_pkg_version "vitest" "$PKG")
    FRONTEND_PKG_MGR=$(grep -oE '"packageManager"[[:space:]]*:[[:space:]]*"[^"]+"' "$PKG" 2>/dev/null | head -1 | sed -E 's/.*"packageManager"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
    FRONTEND_PKG_MGR_VERSION=$(echo "$FRONTEND_PKG_MGR" | sed -E 's/^[^@]+@//')
    FRONTEND_PKG_MGR=$(echo "$FRONTEND_PKG_MGR" | sed -E 's/@.*//')
    [ -z "$FRONTEND_PKG_MGR" ] && FRONTEND_PKG_MGR="npm"
  fi
  FRONTEND_STYLING="Vanilla CSS"
  FRONTEND_STYLING_NOTE="Design tokens в src/styles.css"
  FRONTEND_STRUCTURE="src/
  app/
    pages/        ← routes
    services/     ← API, auth
    components/   ← UI
  assets/
  styles.css      ← global tokens"
  FRONTEND_SCRIPTS="npm start                 # dev server
npm run build             # production build
npm test                  # vitest"
fi

if [ "$DETECTED_STACK" = "backend-api" ] || [ "$DETECTED_STACK" = "fullstack" ]; then
  PKG="$PROJECT_ROOT/$BACKEND_DIR/package.json"
  if [ -f "$PKG" ]; then
    MANIFEST_LIST="$MANIFEST_LIST$BACKEND_DIR/package.json, "
    if grep -q '"@nestjs/core"' "$PKG" 2>/dev/null; then
      BACKEND_FRAMEWORK="NestJS"
      BACKEND_VERSION=$(extract_pkg_version "@nestjs/core" "$PKG")
      BACKEND_VALIDATION="class-validator"
      BACKEND_VALIDATION_VERSION=$(extract_pkg_version "class-validator" "$PKG")
      BACKEND_DECISIONS="- **NestJS modules по bounded context**
- **Validation** глобально через ValidationPipe
- **REST + JSON** (не GraphQL)"
    elif grep -q '"express"' "$PKG" 2>/dev/null; then
      BACKEND_FRAMEWORK="Express"
      BACKEND_VERSION=$(extract_pkg_version "express" "$PKG")
      BACKEND_DECISIONS="- **Express middlewares** для auth/logging
- **TypeScript** strict
- **REST + JSON**"
    fi
    BACKEND_TS_VERSION=$(extract_pkg_version "typescript" "$PKG")
    BACKEND_TEST_RUNNER="vitest"
    BACKEND_TEST_VERSION=$(extract_pkg_version "vitest" "$PKG")
    BACKEND_PKG_MGR="npm"
  fi
  BACKEND_STRUCTURE="src/
  modules/         ← по domain (auth, users, ...)
    <module>/
      <module>.controller.ts
      <module>.service.ts
      dto/
  common/          ← shared decorators, guards
  config/          ← env loader
  main.ts"
  BACKEND_SCRIPTS="npm run start:dev       # watch mode
npm run build            # production
npm run typecheck        # tsc --noEmit
npm test                 # vitest"
fi

if [ "$DETECTED_STACK" = "cli-tool" ]; then
  if [ $HAS_GO_MOD -eq 1 ]; then
    CLI_LANG="Go"
    CLI_LANG_VERSION=$(grep -oE '^go [0-9.]+' "$PROJECT_ROOT/go.mod" 2>/dev/null | head -1 | sed 's/^go //')
    CLI_FRAMEWORK="Cobra"
    CLI_BUILDER="go build"
    CLI_TEST_RUNNER="go test"
    CLI_LINT="go vet"
    MANIFEST_LIST="${MANIFEST_LIST}go.mod, "
    CLI_STRUCTURE="cmd/
  <app>/
    main.go
internal/
  commands/
  config/
  utils/
go.mod
go.sum"
    CLI_SCRIPTS="go build -o bin/<app> .
go test ./...
go vet ./..."
  elif [ $HAS_CARGO_TOML -eq 1 ]; then
    CLI_LANG="Rust"
    CLI_FRAMEWORK="clap"
    CLI_BUILDER="cargo"
    CLI_TEST_RUNNER="cargo test"
    CLI_LINT="cargo clippy"
    MANIFEST_LIST="${MANIFEST_LIST}Cargo.toml, "
    CLI_STRUCTURE="src/
  main.rs
  commands/
  config.rs
  utils/
Cargo.toml"
    CLI_SCRIPTS="cargo build --release
cargo test
cargo clippy"
  elif [ $HAS_PYPROJECT -eq 1 ] || [ $HAS_REQUIREMENTS_TXT -eq 1 ]; then
    CLI_LANG="Python"
    CLI_FRAMEWORK="Click/Typer"
    CLI_BUILDER="python -m build"
    CLI_TEST_RUNNER="pytest"
    CLI_LINT="mypy"
    MANIFEST_LIST="${MANIFEST_LIST}pyproject.toml, "
    CLI_STRUCTURE="src/<app>/
  __init__.py
  __main__.py
  cli.py
  commands/
  utils/
tests/
pyproject.toml"
    CLI_SCRIPTS="poetry run pytest
poetry run mypy .
poetry build"
  fi
fi

# Stack summary line
if [ "$DETECTED_STACK" = "fullstack" ]; then
  STACK_SUMMARY="**$FRONTEND_FRAMEWORK $FRONTEND_VERSION** (frontend) + **$BACKEND_FRAMEWORK $BACKEND_VERSION** (backend)$([ $HAS_DOCKER_COMPOSE -eq 1 ] && echo ' + Docker Compose')."
elif [ "$DETECTED_STACK" = "web-spa" ]; then
  STACK_SUMMARY="**$FRONTEND_FRAMEWORK $FRONTEND_VERSION** (SPA) — TypeScript, Vitest, $FRONTEND_PKG_MGR."
elif [ "$DETECTED_STACK" = "backend-api" ]; then
  STACK_SUMMARY="**$BACKEND_FRAMEWORK $BACKEND_VERSION** (backend API) — TypeScript, Vitest, npm$([ $HAS_DOCKER_COMPOSE -eq 1 ] && echo ', Docker Compose')."
elif [ "$DETECTED_STACK" = "cli-tool" ]; then
  STACK_SUMMARY="**$CLI_LANG** ($CLI_FRAMEWORK) — CLI tool."
fi

# Manifest list
MANIFEST_LIST=$(echo "$MANIFEST_LIST" | sed 's/, $//')

# === STEP 4: Scan module map ===
MODULE_MAP_TABLE=""
NO_MODULES_DETECTED=0
if [ $HAS_BACKEND_DIR -eq 1 ] && [ -d "$PROJECT_ROOT/$BACKEND_DIR/src/modules" ]; then
  for m in "$PROJECT_ROOT/$BACKEND_DIR/src/modules"/*; do
    [ -d "$m" ] || continue
    MNAME=$(basename "$m")
    MODULE_MAP_TABLE="${MODULE_MAP_TABLE}| \`${MNAME}Module\` | \`$BACKEND_DIR/src/modules/$MNAME/\` | domain: $MNAME | — |
"
  done
fi
if [ $HAS_FRONTEND_DIR -eq 1 ] && [ -d "$PROJECT_ROOT/$FRONTEND_DIR/src/app/pages" ]; then
  for p in "$PROJECT_ROOT/$FRONTEND_DIR/src/app/pages"/*; do
    [ -d "$p" ] || continue
    PNAME=$(basename "$p")
    MODULE_MAP_TABLE="${MODULE_MAP_TABLE}| \`${PNAME}\` | \`$FRONTEND_DIR/src/app/pages/$PNAME/\` | page/route | — |
"
  done
fi
if [ -z "$MODULE_MAP_TABLE" ]; then
  NO_MODULES_DETECTED=1
  MODULE_MAP_TABLE="| (пусто) | — | — | — |
"
fi
MODULE_MAP_INTRO="Список модулей/страниц, обнаруженных автоматически. Дополняй вручную по мере развития проекта."

# === STEP 5: Conditional sections ===
# Determine which sections to include
INCLUDE_FRONTEND=0
INCLUDE_BACKEND=0
INCLUDE_CLI=0
INCLUDE_DOCKER=0
case "$DETECTED_STACK" in
  web-spa)       INCLUDE_FRONTEND=1; [ $HAS_DOCKER_COMPOSE -eq 1 ] && INCLUDE_DOCKER=1 ;;
  backend-api)   INCLUDE_BACKEND=1;  [ $HAS_DOCKER_COMPOSE -eq 1 ] && INCLUDE_DOCKER=1 ;;
  fullstack)     INCLUDE_FRONTEND=1; INCLUDE_BACKEND=1; [ $HAS_DOCKER_COMPOSE -eq 1 ] && INCLUDE_DOCKER=1 ;;
  cli-tool)      INCLUDE_CLI=1 ;;
esac

# === STEP 6: Render template ===
# Read template into variable (avoid subshell)
TEMPLATE_CONTENT="$(cat "$TEMPLATE")"

# Section numbering — recalculate as we may delete sections
# (Each section is numbered based on its order in the output; excluded sections
# contribute nothing. Placeholders for excluded sections are left empty.)
SECTION_FRONTEND_NUM=""
SECTION_BACKEND_NUM=""
SECTION_CLI_NUM=""
SECTION_INFRA_NUM=""
SECTION_CROSSCUTTING_NUM=""
SECTION_MODULEMAP_NUM=""
SECTION_COMMANDS_NUM=""
SECTION_DECISIONS_NUM=""
SECTION_TESTING_NUM=""
SECTION_REFS_NUM=""
SECTION_WHATSNOT_NUM=""

NEXT=1
[ $INCLUDE_FRONTEND -eq 1 ] && { SECTION_FRONTEND_NUM=$NEXT; NEXT=$((NEXT+1)); }
[ $INCLUDE_BACKEND  -eq 1 ] && { SECTION_BACKEND_NUM=$NEXT;  NEXT=$((NEXT+1)); }
[ $INCLUDE_CLI      -eq 1 ] && { SECTION_CLI_NUM=$NEXT;      NEXT=$((NEXT+1)); }
[ $INCLUDE_DOCKER   -eq 1 ] && { SECTION_INFRA_NUM=$NEXT;    NEXT=$((NEXT+1)); }
SECTION_CROSSCUTTING_NUM=$NEXT; NEXT=$((NEXT+1))
SECTION_MODULEMAP_NUM=$NEXT;    NEXT=$((NEXT+1))
SECTION_COMMANDS_NUM=$NEXT;     NEXT=$((NEXT+1))
SECTION_DECISIONS_NUM=$NEXT;    NEXT=$((NEXT+1))
SECTION_TESTING_NUM=$NEXT;      NEXT=$((NEXT+1))
SECTION_REFS_NUM=$NEXT;         NEXT=$((NEXT+1))
SECTION_WHATSNOT_NUM=$NEXT

# Process IF blocks using awk (more robust than sed for multi-line)
# This deletes lines between {{#IF_X}} and {{/IF_X}} (inclusive of markers) when X is 0
render_block() {
  local content="$1"
  local var_name="$2"
  local should_include="$3"
  if [ "$should_include" -eq 0 ]; then
    # Delete block: from "<!-- IF_X_START -->" or "{{#IF_X}}" to "{{/IF_X}}" or similar
    # Use perl-style multi-line with awk
    echo "$content" | awk -v v="$var_name" -v inc="$should_include" '
      BEGIN { skip=0 }
      /\{\{#IF_/ {
        match($0, /\{\{#IF_[A-Z_]+\}\}/)
        block=substr($0, RSTART, RLENGTH)
        b=substr(block, 5, length(block)-7)
        if (b == v) { skip=1; next }
      }
      /\{\{\/IF_/ {
        match($0, /\{\{\/IF_[A-Z_]+\}\}/)
        block=substr($0, RSTART, RLENGTH)
        b=substr(block, 6, length(block)-8)
        if (b == v) { skip=0; next }
      }
      { if (!skip) print }
    '
  else
    echo "$content" | awk -v v="$var_name" -v inc="$should_include" '
      BEGIN { skip=0 }
      /\{\{#IF_/ {
        match($0, /\{\{#IF_[A-Z_]+\}\}/)
        block=substr($0, RSTART, RLENGTH)
        b=substr(block, 5, length(block)-7)
        if (b == v) { skip=1; next }
      }
      /\{\{\/IF_/ {
        match($0, /\{\{\/IF_[A-Z_]+\}\}/)
        block=substr($0, RSTART, RLENGTH)
        b=substr(block, 6, length(block)-8)
        if (b == v) { skip=0; next }
      }
      { if (!skip) print }
    ' | sed -E 's/\{\{#IF_[A-Z_]+\}\}//g; s/\{\{\/IF_[A-Z_]+\}\}//g'
  fi
}

# Simpler approach: use sed with multi-line ranges via a different mechanism
# Actually awk is more reliable for this — let me use it directly per block

# Build the output step by step
OUTPUT_CONTENT="$TEMPLATE_CONTENT"

# Helper: process all IF blocks
process_if_blocks() {
  local content="$1"
  local var="$2"
  local include="$3"
  echo "$content" | awk -v v="$var" -v inc="$include" '
    BEGIN { skip = 0 }
    /\{\{#IF_/ {
      line = $0
      sub(/.*\{\{#IF_/, "", line)
      sub(/\}\}.*/, "", line)
      block_name = line
      if (block_name == v) {
        if (inc == 0) { skip = 1; next }
        else { sub(/\{\{#IF_[A-Z_]+\}\}/, ""); print; next }
      }
    }
    /\{\{\/IF_/ {
      line = $0
      sub(/.*\{\{\/IF_/, "", line)
      sub(/\}\}.*/, "", line)
      block_name = line
      if (block_name == v) {
        if (inc == 1) { sub(/\{\{\/IF_[A-Z_]+\}\}/, ""); print; skip = 0; next }
        else { skip = 0; next }
      }
    }
    { if (!skip) print }
  '
}

# Process each conditional block
OUTPUT_CONTENT=$(process_if_blocks "$OUTPUT_CONTENT" "FRONTEND" "$INCLUDE_FRONTEND")
OUTPUT_CONTENT=$(process_if_blocks "$OUTPUT_CONTENT" "BACKEND"  "$INCLUDE_BACKEND")
OUTPUT_CONTENT=$(process_if_blocks "$OUTPUT_CONTENT" "CLI"     "$INCLUDE_CLI")
OUTPUT_CONTENT=$(process_if_blocks "$OUTPUT_CONTENT" "DOCKER"  "$INCLUDE_DOCKER")
# NO_MODULES_DETECTED: 1=include block (markers stripped, content kept),
#                     0=remove block entirely.
# FIX: previous version only called process_if_blocks when NO_MODULES_DETECTED=0,
# which left the {{#IF_NO_MODULES_DETECTED}}...{{/IF_NO_MODULES_DETECTED}} markers
# visible in STACK.md whenever modules were NOT detected (the common case in
# fresh projects). Now we always process the block and pass the flag directly.
OUTPUT_CONTENT=$(process_if_blocks "$OUTPUT_CONTENT" "NO_MODULES_DETECTED" "$NO_MODULES_DETECTED")

# Now substitute placeholders (using sed for simple value substitution)
# We use | as delimiter to avoid conflicts with / in values
substitute() {
  local content="$1"
  local key="$2"
  local val="$3"
  # Use awk to do per-line replacement safely (handles special chars).
  # val передаётся в awk через -v — awk не интерпретирует sed-метасимволы,
  # поэтому дополнительное экранирование не нужно. (Раньше здесь был dead code
  # `escaped_val=$(sed 's/|/\\|/g')` который нигде не использовался.)
  echo "$content" | awk -v k="$key" -v v="$val" '
    {
      # Find and replace {{KEY}} globally in the line
      while (match($0, "{{" k "}}")) {
        $0 = substr($0, 1, RSTART-1) v substr($0, RSTART+RLENGTH)
      }
      print
    }
  '
}

OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "PROJECT_NAME" "$PROJECT_NAME")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "GENERATED_AT" "$(date +%Y-%m-%d)")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "MANIFEST_LIST" "$MANIFEST_LIST")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "STACK_SUMMARY" "$STACK_SUMMARY")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "LAUNCH_CMD" "./start.sh")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_DIR" "$FRONTEND_DIR")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_DIR" "$BACKEND_DIR")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_DIR" "$FRONTEND_DIR")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_FRAMEWORK" "$FRONTEND_FRAMEWORK")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_VERSION" "$FRONTEND_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_FRAMEWORK_NOTE" "—")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_BUILDER" "$FRONTEND_BUILDER")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_BUILDER_VERSION" "$FRONTEND_BUILDER_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_TS_VERSION" "$FRONTEND_TS_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_STYLING" "$FRONTEND_STYLING")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_STYLING_NOTE" "$FRONTEND_STYLING_NOTE")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_TEST_RUNNER" "$FRONTEND_TEST_RUNNER")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_TEST_VERSION" "$FRONTEND_TEST_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_TEST_NOTE" "—")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_PKG_MGR" "$FRONTEND_PKG_MGR")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_PKG_MGR_VERSION" "$FRONTEND_PKG_MGR_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_PKG_MGR_NOTE" "—")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_STRUCTURE" "$FRONTEND_STRUCTURE")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_SCRIPTS" "$FRONTEND_SCRIPTS")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "FRONTEND_DECISIONS" "$FRONTEND_DECISIONS")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_FRAMEWORK" "$BACKEND_FRAMEWORK")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_VERSION" "$BACKEND_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_FRAMEWORK_NOTE" "—")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_DB" "$BACKEND_DB")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_DB_VERSION" "$BACKEND_DB_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_DB_NOTE" "—")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_AUTH" "$BACKEND_AUTH")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_AUTH_VERSION" "$BACKEND_AUTH_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_AUTH_NOTE" "—")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_VALIDATION" "$BACKEND_VALIDATION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_VALIDATION_VERSION" "$BACKEND_VALIDATION_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_TEST_RUNNER" "$BACKEND_TEST_RUNNER")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_TEST_VERSION" "$BACKEND_TEST_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_TS_VERSION" "$BACKEND_TS_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_PKG_MGR" "$BACKEND_PKG_MGR")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_PKG_MGR_VERSION" "$BACKEND_PKG_MGR_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_STRUCTURE" "$BACKEND_STRUCTURE")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_SCRIPTS" "$BACKEND_SCRIPTS")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "BACKEND_DECISIONS" "$BACKEND_DECISIONS")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_LANG" "$CLI_LANG")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_LANG_VERSION" "$CLI_LANG_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_FRAMEWORK" "$CLI_FRAMEWORK")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_FRAMEWORK_VERSION" "$CLI_FRAMEWORK_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_BUILDER" "$CLI_BUILDER")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_BUILDER_VERSION" "$CLI_BUILDER_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_TEST_RUNNER" "$CLI_TEST_RUNNER")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_TEST_VERSION" "$CLI_TEST_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_LINT" "$CLI_LINT")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_LINT_VERSION" "$CLI_LINT_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_STRUCTURE" "$CLI_STRUCTURE")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "CLI_SCRIPTS" "$CLI_SCRIPTS")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_FRONTEND_NUM" "$SECTION_FRONTEND_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_BACKEND_NUM" "$SECTION_BACKEND_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_CLI_NUM" "$SECTION_CLI_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_INFRA_NUM" "$SECTION_INFRA_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_CROSSCUTTING_NUM" "$SECTION_CROSSCUTTING_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_MODULEMAP_NUM" "$SECTION_MODULEMAP_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_COMMANDS_NUM" "$SECTION_COMMANDS_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_DECISIONS_NUM" "$SECTION_DECISIONS_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_TESTING_NUM" "$SECTION_TESTING_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_REFS_NUM" "$SECTION_REFS_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SECTION_WHATSNOT_NUM" "$SECTION_WHATSNOT_NUM")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "RUNTIME" "Node.js 22+")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "RUNTIME_VERSION" ">=22.0.0")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "PKG_MGR" "$FRONTEND_PKG_MGR")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "PKG_MGR_VERSION" "$FRONTEND_PKG_MGR_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "TS_VERSION" "$FRONTEND_TS_VERSION")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "LINT_TOOL" "ESLint / Prettier")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "LINT_NOTE" "format check")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "MODULE_MAP_INTRO" "$MODULE_MAP_INTRO")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "MODULE_MAP_TABLE" "$MODULE_MAP_TABLE")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "QUICKSTART_CMDS" "# Запуск (если есть start.sh)
./start.sh start    # dev: docker + backend + frontend
./start.sh status   # health check
./start.sh stop     # остановить")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "SUBSECTION_CMDS" "npm run dev        # замените на реальный скрипт вашего проекта
npm run build      # production build
npm test           # запустить тесты

> 💡 Замените команды на актуальные из вашего package.json/requirements.txt.
>    Этот файл сгенерирован автоматически — обновите под свой стек.")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "ARCH_DECISIONS_TABLE" "| (заполни вручную после прочтения _stacks/<stack>.md) | — |")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "TESTING_TABLE" "| Unit | vitest | Сервисы, components |
| E2E | (если есть) | Full flow |")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "DOCKER_SERVICES_TABLE" "| (обнаружен docker-compose; конкретные сервисы добавь вручную) | — | — | — |")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "DOCKER_COMPOSE_PATH" "docker-compose.yml")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "DOCKER_EXTRA_NOTES" "(дополни файлы добавь вручную)")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "ENV_VARS_TABLE" "| (env vars) | (кто читает) | (default) |")
OUTPUT_CONTENT=$(substitute "$OUTPUT_CONTENT" "URLS_TABLE" "| (URL) | — |")

# === STEP 7: Check if STACK.md exists ===
if [ -f "$OUTPUT" ] && [ $FORCE -eq 0 ]; then
  if [ $AUTO -eq 1 ]; then
    echo "⏭  STACK.md уже существует (--auto, skip). Use --force для перезаписи."
    exit 0
  fi
  echo "⚠️  STACK.md уже существует: $OUTPUT"
  printf "Перезаписать? [y/N] "
  read -r ans
  case "$ans" in
    y|Y|yes|YES) ;;
    *) echo "Aborted."; exit 2 ;;
  esac
fi

# === STEP 8: Write or dry-run ===
if [ $DRY_RUN -eq 1 ]; then
  echo "─── DRY RUN: would write to $OUTPUT ($(echo "$OUTPUT_CONTENT" | wc -l) lines) ───"
  echo "$OUTPUT_CONTENT" | head -50
  echo "... (truncated)"
  exit 0
fi

printf '%s\n' "$OUTPUT_CONTENT" > "$OUTPUT"
echo "✅ STACK.md written: $OUTPUT ($(wc -l < "$OUTPUT") lines, stack=$DETECTED_STACK)"
echo ""
echo "Что дальше:"
echo "  1. Открой STACK.md — заполни (пустые) поля в §Архитектурные решения"
echo "  2. После изменения стека — запусти: bash $SCRIPT_DIR/kit-stack.sh --force"
echo "  3. Создай первую задачу: bash $SCRIPT_DIR/make-tz.sh \"My first feature\""
