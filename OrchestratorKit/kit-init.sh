#!/usr/bin/env bash
# kit-init.sh — bootstrap OrchestratorKit в новом проекте (идемпотентно)
#
# Usage:
#   bash kit-init.sh
#   bash kit-init.sh --no-stack    # skip auto STACK.md generation
#
# Что делает:
#   1. chmod +x на все .sh скрипты в kit-е
#   2. Создаёт _active/, _archive/YYYY-MM/, .mimocode/locks/
#   3. Создаёт root progress.md и ARCHITECTURE.md (если отсутствуют)
#   4. Запускает kit-stack.sh (auto-detect → STACK.md) — non-interactive в --auto
#   5. Запускает verify-status.sh для подтверждения
#
# Идемпотентен: повторный запуск не ломает существующие файлы.

set -uo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd || echo "")"

# Parse args
NO_STACK=0
for arg in "$@"; do
  case "$arg" in
    --no-stack) NO_STACK=1 ;;
  esac
done

if [ -z "$PROJECT_ROOT" ] || [ "$PROJECT_ROOT" = "/" ] || [ "$PROJECT_ROOT" = "$SCRIPT_DIR" ]; then
  echo "⚠️  WARN: не удалось определить project root (ожидается ../ от $SCRIPT_DIR)."
  echo "          Продолжаю только с внутренними делами kit-а (skip шаг 3)."
  PROJECT_ROOT=""
fi

echo "🚀 Kit init: $SCRIPT_DIR"
[ -n "$PROJECT_ROOT" ] && echo "📁 Project root: $PROJECT_ROOT"
echo ""

# 1. chmod +x на .sh скрипты
echo "[1/5] chmod +x на скрипты..."
count=0
for f in "$SCRIPT_DIR"/*.sh; do
  [ -f "$f" ] || continue
  chmod +x "$f" 2>/dev/null && count=$((count+1))
done
echo "  ✓ $count скрипт(ов) сделано executable"

# 2. Создать _active/, _archive/YYYY-MM/, .mimocode/locks/
echo "[2/5] Создаю _active/, _archive/, .mimocode/locks/..."
mkdir -p "$SCRIPT_DIR/_active"
mkdir -p "$SCRIPT_DIR/_archive/$(date +%Y-%m)"
mkdir -p "$SCRIPT_DIR/.mimocode/locks"
echo "  ✓ готово"

# 3. Bootstrap root progress.md и ARCHITECTURE.md (если отсутствуют)
echo "[3/5] Bootstrap root progress.md, ARCHITECTURE.md (если отсутствуют)..."

if [ -n "$PROJECT_ROOT" ]; then
  if [ ! -f "$PROJECT_ROOT/progress.md" ]; then
    cat > "$PROJECT_ROOT/progress.md" <<'PROGRESS_EOF'
# Progress Log — <название проекта>

> Журнал прогресса, обновляется после каждого TZ.

---

(будет пополняться)
PROGRESS_EOF
    echo "  ✓ создан progress.md"
  else
    echo "  - progress.md уже существует (skip)"
  fi

  if [ ! -f "$PROJECT_ROOT/ARCHITECTURE.md" ]; then
    cat > "$PROJECT_ROOT/ARCHITECTURE.md" <<'ARCH_EOF'
# Architecture — <название проекта>

> Корневой архитектурный документ.

## 1. Общая схема
<!-- пусто -->

## 2. Конвенции
<!-- пусто -->

## 3. Зоны ответственности агентов

| Зона | Файлы | Агент-владелец |
|------|-------|----------------|
<!-- пусто -->

## 4. Открытые вопросы / отложенные задачи
<!-- пусто -->

---

(будет пополняться)
ARCH_EOF
    echo "  ✓ создан ARCHITECTURE.md"
  else
    echo "  - ARCHITECTURE.md уже существует (skip)"
  fi
else
  echo "  - skip (нет project root)"
fi

# 4. Generate STACK.md (auto-detect stack from project files)
echo "[4/5] Auto-detect stack → STACK.md..."
if [ $NO_STACK -eq 1 ]; then
  echo "  - skip (--no-stack)"
elif [ -z "$PROJECT_ROOT" ]; then
  echo "  - skip (нет project root)"
elif [ ! -f "$SCRIPT_DIR/kit-stack.sh" ]; then
  echo "  - skip (kit-stack.sh не найден)"
elif [ -f "$PROJECT_ROOT/STACK.md" ] && [ ! -t 0 ]; then
  # Non-interactive (no TTY) + STACK.md exists: don't prompt, skip
  echo "  - STACK.md уже существует + non-interactive → skip (запусти kit-stack.sh --force вручную)"
else
  bash "$SCRIPT_DIR/kit-stack.sh" --auto
  echo ""
fi

# 5. verify-status.sh
echo "[5/5] Запускаю verify-status.sh..."
echo ""
bash "$SCRIPT_DIR/verify-status.sh"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Kit initialized."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Что дальше:"
echo "  1. Проверь STACK.md в корне проекта (создан автоматически)"
echo "  2. Создать первый TZ:"
echo "     bash $SCRIPT_DIR/make-tz.sh \"My first feature\""
echo ""
echo "  3. Передать агенту:"
echo "     «Прочитай $SCRIPT_DIR/AGENTS.md и $SCRIPT_DIR/TZ-01.txt,"
echo "       затем выполни TZ-01.»"
