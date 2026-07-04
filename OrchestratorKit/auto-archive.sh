#!/usr/bin/env bash
# auto-archive.sh — автоматизирует TZF-00 ШАГ 6 (финализация TZ)
#
# Usage:
#   bash auto-archive.sh TZ-NN done [progress_entry] [architecture_row]
#   bash auto-archive.sh TZ-NN failed [progress_entry] [architecture_row]
#
# Что делает:
#   1. Находит TZ-NN.txt (в root или _active/)
#   2. Копирует в _archive/YYYY-MM/TZ-NN.{done,failed}.txt с ARCHIVE_MARKER
#   3. Удаляет из _active/ (если там был)
#   4. Создаёт lock-файл .mimocode/locks/TZ-NN-*.lock (только для DONE)
#   5. Перемещает строку в STATUS.md (READY/IN WORK → DONE/FAILED)
#   6. Опционально добавляет запись в root progress.md и ARCHITECTURE.md
#   7. Запускает verify-status.sh

set -uo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd || echo "")"

TZ="${1:-}"
OUTCOME="${2:-done}"
PROGRESS_ENTRY="${3:-}"
ARCH_ROW="${4:-}"

if [ -z "$TZ" ]; then
  echo "Usage: $0 TZ-NN [done|failed] [progress_entry] [architecture_row]" >&2
  echo "  TZ-NN: like TZ-01, TZ-13" >&2
  echo "  outcome: done (default) or failed" >&2
  exit 1
fi

case "$OUTCOME" in
  done)   EXT="done" ;;
  failed) EXT="failed" ;;
  *) echo "❌ outcome должен быть 'done' или 'failed', получено: '$OUTCOME'" >&2; exit 1 ;;
esac

STATUS="$SCRIPT_DIR/STATUS.md"
ARCHIVE_DIR="$SCRIPT_DIR/_archive/$(date +%Y-%m)"
LOCKS_DIR="$SCRIPT_DIR/.mimocode/locks"
TODAY=$(date +%Y-%m-%d)

mkdir -p "$ARCHIVE_DIR" "$LOCKS_DIR"

# 1. Найти TZ source
SRC=""
if [ -f "$SCRIPT_DIR/_active/${TZ}.txt" ]; then
  SRC="$SCRIPT_DIR/_active/${TZ}.txt"
elif [ -f "$SCRIPT_DIR/${TZ}.txt" ]; then
  SRC="$SCRIPT_DIR/${TZ}.txt"
else
  echo "❌ ${TZ}.txt не найден ни в _active/, ни в корне kit-а." >&2
  echo "   Проверь: ls $SCRIPT_DIR/${TZ}.txt $SCRIPT_DIR/_active/${TZ}.txt" >&2
  exit 1
fi

# Extract title из TZ файла (ищем первую строку после "TZ-NN: ")
TITLE=$(grep -E "^${TZ}:" "$SRC" | head -1 | sed "s/^${TZ}:[[:space:]]*//")
[ -z "$TITLE" ] && TITLE="(см. TZ)"

# Slug для lock файла
SLUG=$(echo "$TZ" | tr '[:upper:]' '[:lower:]')

TARGET="$ARCHIVE_DIR/${TZ}.${EXT}.txt"

# 2. Скопировать TZ в архив + добавить ARCHIVE_MARKER
cp "$SRC" "$TARGET"

cat >> "$TARGET" <<MARKER_EOF

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
═══════════════════════════════════════════════════════════════
MARKER_EOF

if [ "$EXT" = "done" ]; then
  cat >> "$TARGET" <<MARKER_EOF
outcome: DONE
closed_at: ${TODAY}
closed_by: $(grep -E "^РОЛЬ АГЕНТА:" "$SRC" | head -1 | sed 's/^РОЛЬ АГЕНТА:[[:space:]]*//' | head -c 80)
next_steps: —
MARKER_EOF
else
  cat >> "$TARGET" <<MARKER_EOF
outcome: FAILED
closed_at: ${TODAY}
failure_reason: (см. отчёт агента)
partial_progress: (что успели)
next_steps: (successor-TZ с номером, см. TZF-00 §5)
lock_file_skipped: TRUE
MARKER_EOF
fi

# 3. Удалить из _active/ (если был)
if [ -f "$SCRIPT_DIR/_active/${TZ}.txt" ]; then
  rm "$SCRIPT_DIR/_active/${TZ}.txt"
  echo "🗑  Удалён из _active/: ${TZ}.txt"
fi

# 4. Создать lock-файл (только для DONE)
if [ "$EXT" = "done" ]; then
  LOCK_FILE="$LOCKS_DIR/${TZ}-${SLUG}.lock"
  PROTECTED=$(grep -E "^CONFLICT KEYS:" "$SRC" -A 3 | grep "^-" | sed 's/^- //' | tr '\n' ';' | sed 's/;$//')
  [ -z "$PROTECTED" ] && PROTECTED="(см. CONFLICT KEYS в ${TZ}.done.txt)"

  cat > "$LOCK_FILE" <<LOCK_EOF
# Lock file
Locked as of ${TODAY} — ${TZ}: ${TITLE}.

Owner: $(grep -E "^РОЛЬ АГЕНТА:" "$SRC" | head -1 | sed 's/^РОЛЬ АГЕНТА:[[:space:]]*//' | head -c 80)
Protected files:
  ${PROTECTED}

Unlock: only via orchestrator approval (новое TZ-NN с пометкой «successor»).
LOCK_EOF
  echo "🔒 Создан lock: $LOCK_FILE"
fi

# 5. Обновить STATUS.md (READY/IN WORK → DONE/FAILED)
if [ -f "$STATUS" ]; then
  # 5a. Удалить из текущей секции
  TZ_ROW=$(grep -n "^| ${TZ} |" "$STATUS" | head -1 | cut -d: -f1)
  if [ -n "$TZ_ROW" ]; then
    sed -i "${TZ_ROW}d" "$STATUS"
  fi

  # 5b. Добавить в target секцию
  case "$EXT" in
    done)
      DIV=$(awk '/^## .*DONE/{found=1; next} found && /^\|[-\s|]+\|/{print NR; exit}' "$STATUS")
      ROW="| ${TZ} | ${TODAY} | ${TITLE} | [${TARGET}](${TARGET}) |"
      ;;
    failed)
      DIV=$(awk '/^## .*FAILED/{found=1; next} found && /^\|[-\s|]+\|/{print NR; exit}' "$STATUS")
      ROW="| ${TZ} | ${TODAY} | ${TITLE} (FAILED) | [${TARGET}](${TARGET}) |"
      ;;
  esac

  if [ -n "$DIV" ] && [ -n "$ROW" ]; then
    sed -i "${DIV}a\\${ROW}" "$STATUS"
    echo "📋 STATUS.md обновлён: ${TZ} → ${EXT^^}"
  else
    echo "⚠️  WARN: не нашёл divider в target секции STATUS.md. Добавьте строку вручную:"
    echo "   $ROW"
  fi
else
  echo "⚠️  WARN: STATUS.md не найден, не обновлён."
fi

# 6. Опционально: progress.md + ARCHITECTURE.md
if [ -n "$PROJECT_ROOT" ] && [ -n "$PROGRESS_ENTRY" ] && [ -f "$PROJECT_ROOT/progress.md" ]; then
  echo "" >> "$PROJECT_ROOT/progress.md"
  echo "## ${TODAY} — Завершено: ${TZ} (${TITLE})" >> "$PROJECT_ROOT/progress.md"
  echo "$PROGRESS_ENTRY" >> "$PROJECT_ROOT/progress.md"
  echo "📝 progress.md обновлён"
fi

if [ -n "$PROJECT_ROOT" ] && [ -n "$ARCH_ROW" ] && [ -f "$PROJECT_ROOT/ARCHITECTURE.md" ]; then
  echo "" >> "$PROJECT_ROOT/ARCHITECTURE.md"
  echo "$ARCH_ROW" >> "$PROJECT_ROOT/ARCHITECTURE.md"
  echo "🏗  ARCHITECTURE.md обновлён"
fi

# 7. verify-status.sh
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 Запускаю verify-status.sh для подтверждения..."
echo "═══════════════════════════════════════════════════════════"
echo ""
bash "$SCRIPT_DIR/verify-status.sh"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ ${TZ} архивирован: $TARGET"
echo "═══════════════════════════════════════════════════════════"
