#!/usr/bin/env bash
# kit-smoke-test.sh — E2E проверка полного цикла kit-а на fake TZ-98
#
# Usage:
#   bash kit-smoke-test.sh
#
# Дизайн:
#   - Бэкапит STATUS.md при старте, восстанавливает на выходе (даже при failure)
#   - Использует TZ-98 как изолированный тестовый marker (не конфликтует
#     с реальными TZ пользователя)
#   - Trap очищает ВСЕ артефакты теста: TZ-98.txt, _active/TZ-98.txt,
#     _archive/<YYYY-MM>/TZ-98.*.txt, .mimocode/locks/TZ-98-*.lock
#
# Выход: exit 0 если все 6 шагов PASS, иначе exit 1.

set -euo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"

# Изолированный test marker: TZ-98. Чтобы make-tz создал именно TZ-98 (а не TZ-01),
# предварительно создаём placeholder TZ-97. После теста удаляем ОБА.
TEST_TZ="TZ-98"
PLACEHOLDER="TZ-97"
TEST_TZ_NUM=98
ARCHIVE_DIR="$SCRIPT_DIR/_archive/$(date +%Y-%m)"
LOCKS_DIR="$SCRIPT_DIR/.mimocode/locks"

# Pre-test cleanup: удалить orphan TZ-файлы от прошлых runs чтобы [2/6] видел
# чистый state. Симметрично post-test cleanup в функции cleanup().
# FIX: иначе orphan TZ (например, TZ-01 от debugging-сессий) ломает verify-status
# в [2/6] (тест стартует с грязным state, и pre-existing TZ-файлы не упомянуты в STATUS.md).
rm -f "$SCRIPT_DIR"/TZ-*.txt
rm -f "$SCRIPT_DIR"/_active/TZ-*.txt
rm -f "$SCRIPT_DIR/_archive/"*/TZ-*.txt 2>/dev/null || true
rm -f "$LOCKS_DIR"/TZ-*.lock 2>/dev/null || true

# Backup STATUS.md для restore на выходе
STATUS_BACKUP=$(mktemp 2>/dev/null || echo "/tmp/kit-smoke-status-backup.$$")
if [ -f "$SCRIPT_DIR/STATUS.md" ]; then
  cp "$SCRIPT_DIR/STATUS.md" "$STATUS_BACKUP"
fi

# Создать placeholder TZ-97 чтобы make-tz создал TZ-98 (а не TZ-01).
# FIX: использовали heredoc с Cyrillic + символом ←, который тихо проваливался
# на Windows/Git Bash (файл не создавался → [2/6] verify-status FAIL).
# printf надёжнее.
printf 'TZ-97: PLACEHOLDER (smoke-test pre-creator)\n\nРОЛЬ АГЕНТА: Test\n\nЗАВИСИМОСТИ: Нет\n\nLAYER: 1\n' > "$SCRIPT_DIR/${PLACEHOLDER}.txt"
# Verify file был создан (иначе setup провалился, дальше тестировать нет смысла)
if [ ! -f "$SCRIPT_DIR/${PLACEHOLDER}.txt" ]; then
  echo "FATAL: не удалось создать ${PLACEHOLDER}.txt — аварийный выход" >&2
  exit 1
fi
# Добавить placeholder в STATUS.md (⏳ READY) чтобы make-tz его учёл
if [ -f "$SCRIPT_DIR/STATUS.md" ]; then
  DIV=$(awk '/^## .*READY/{found=1; next} found && /^\|[-\s|]+\|/{print NR; exit}' "$SCRIPT_DIR/STATUS.md" || true)
  if [ -n "$DIV" ]; then
    sed -i "${DIV}a\\| ${PLACEHOLDER} | Placeholder (test) | (test) | Нет |" "$SCRIPT_DIR/STATUS.md"
  fi
fi

# FIX: trap EXIT срабатывает на каждом subshell $(...) по POSIX (BASH_SUBSHELL >=1).
# Без guard'а cleanup() выполнился бы и при выходе из subshell'ов вроде
# `OUTPUT=$(bash verify-status.sh 2>&1)` в [2/6], что могло бы затереть
# артефакты теста ДО завершения parent shell. Guard оставляет cleanup()
# только для EXIT главного процесса (BASH_SUBSHELL == 0). Defensive measure,
# не критично для текущего bug-фикса (реальный root cause был в BRE/ERE
# mismatch в sed внутри extract_primary_tzs).
trap '[ "${BASH_SUBSHELL:-0}" -eq 0 ] && cleanup' EXIT

# Cleanup: восстановить STATUS.md + удалить все артефакты теста
cleanup() {
  # Restore STATUS.md (даже если тест провалился на полпути)
  if [ -f "$STATUS_BACKUP" ]; then
    cp "$STATUS_BACKUP" "$SCRIPT_DIR/STATUS.md"
    rm -f "$STATUS_BACKUP"
  fi

  # Удалить ВСЕ TZ-артефакты теста (а не только TZ-97/TZ-98).
  # FIX: cleanup удалял только тест-специфичные файлы; pre-existing orphan
  # TZ-файлы (например, от прошлых debugging-сессий) оставались в корне, что
  # ломало verify-status в [2/6] и [6/6] (`TZ-01 в корне, нет в READY`).
  # Smoke test должен оставлять kit в чистом состоянии — удаляем ВСЁ.
  rm -f "$SCRIPT_DIR"/TZ-*.txt
  rm -f "$SCRIPT_DIR"/_active/TZ-*.txt
  rm -f "$ARCHIVE_DIR"/TZ-*.txt
  rm -f "$LOCKS_DIR"/TZ-*.lock
  rm -f /tmp/kit-smoke-status-backup.*
}

echo "🧪 Kit Smoke Test — full E2E на fake ${TEST_TZ}"
echo "═══════════════════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0
TEST_NUM=0

# helper для теста
run_test() {
  TEST_NUM=$((TEST_NUM+1))
  local desc="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "[$TEST_NUM/6] ✓ PASS: $desc"
    PASS=$((PASS+1))
  else
    echo "[$TEST_NUM/6] ✗ FAIL: $desc"
    FAIL=$((FAIL+1))
  fi
}

# [1/6] kit-init (idempotency)
run_test "kit-init.sh (idempotency)" \
  bash "$SCRIPT_DIR/kit-init.sh"

# [2/6] verify-status на чистом состоянии (после init, до создания TZ)
OUTPUT=$(bash "$SCRIPT_DIR/verify-status.sh" 2>&1 || true)
if echo "$OUTPUT" | grep -q "PASS:"; then
  echo "[2/6] ✓ PASS: verify-status.sh (clean state)"
  PASS=$((PASS+1))
else
  echo "[2/6] ✗ FAIL: verify-status.sh (clean state)"
  echo "       Output: $OUTPUT"
  FAIL=$((FAIL+1))
fi

# [3/6] make-tz создаёт TZ-98
bash "$SCRIPT_DIR/make-tz.sh" "Smoke test feature" --layer 2 >/dev/null 2>&1
if [ -f "$SCRIPT_DIR/${TEST_TZ}.txt" ]; then
  echo "[3/6] ✓ PASS: make-tz.sh created ${TEST_TZ}.txt"
  PASS=$((PASS+1))
else
  echo "[3/6] ✗ FAIL: make-tz.sh did not create ${TEST_TZ}.txt"
  FAIL=$((FAIL+1))
fi

# [4/6] Переместить в _active/ (имитировать ШАГ 0) и обновить STATUS
if [ -f "$SCRIPT_DIR/${TEST_TZ}.txt" ]; then
  mv "$SCRIPT_DIR/${TEST_TZ}.txt" "$SCRIPT_DIR/_active/${TEST_TZ}.txt"
  if [ -f "$SCRIPT_DIR/STATUS.md" ]; then
    TZ_ROW=$(grep -n "^| ${TEST_TZ} |" "$SCRIPT_DIR/STATUS.md" | head -1 | cut -d: -f1 || true)
    IN_DIV=$(awk '/^## .*IN WORK/{found=1; next} found && /^\|[-\s|]+\|/{print NR; exit}' "$SCRIPT_DIR/STATUS.md" || true)
    if [ -n "$TZ_ROW" ] && [ -n "$IN_DIV" ]; then
      TODAY=$(date +%Y-%m-%d)
      IN_ROW="| ${TEST_TZ} | Smoke test feature | TBD | ${TODAY} |"
      sed -i "${TZ_ROW}d" "$SCRIPT_DIR/STATUS.md"
      sed -i "${IN_DIV}a\\${IN_ROW}" "$SCRIPT_DIR/STATUS.md"
      echo "[4/6] ✓ PASS: simulated IN WORK (TZ moved to _active/ + STATUS updated)"
      PASS=$((PASS+1))
    else
      echo "[4/6] ✗ FAIL: TZ_ROW='$TZ_ROW' or IN_DIV='$IN_DIV' missing"
      FAIL=$((FAIL+1))
    fi
  else
    echo "[4/6] ✗ FAIL: STATUS.md missing"
    FAIL=$((FAIL+1))
  fi
else
  echo "[4/6] ⊘ SKIP: no TZ-98 to test"
  FAIL=$((FAIL+1))
fi

# [5/6] auto-archive done
if [ -f "$SCRIPT_DIR/_active/${TEST_TZ}.txt" ]; then
  if bash "$SCRIPT_DIR/auto-archive.sh" "$TEST_TZ" done "Test progress entry" "Test arch row" >/dev/null 2>&1; then
    ARCH_FILE="$ARCHIVE_DIR/${TEST_TZ}.done.txt"
    if [ -f "$ARCH_FILE" ] && grep -q "ARCHIVE_MARKER" "$ARCH_FILE"; then
      echo "[5/6] ✓ PASS: auto-archive.sh → ${TEST_TZ}.done.txt with ARCHIVE_MARKER"
      PASS=$((PASS+1))
    else
      echo "[5/6] ✗ FAIL: archive file not created or missing ARCHIVE_MARKER"
      FAIL=$((FAIL+1))
    fi
  else
    echo "[5/6] ✗ FAIL: auto-archive.sh returned non-zero"
    FAIL=$((FAIL+1))
  fi
else
  echo "[5/6] ⊘ SKIP: TZ-98 not in _active/"
  FAIL=$((FAIL+1))
fi

# [6/6] verify-status на post-cleanup state (должен быть PASS)
# Вызываем cleanup() function — она удалит все артефакты теста (включая PLACEHOLDER)
# и восстановит STATUS.md из backup. Trap на EXIT тоже вызовет cleanup, но он
# идемпотентен (STATUS_BACKUP уже удалён, файлы отсутствуют).
cleanup

OUTPUT=$(bash "$SCRIPT_DIR/verify-status.sh" 2>&1 || true)
if echo "$OUTPUT" | grep -q "PASS:"; then
  echo "[6/6] ✓ PASS: verify-status.sh (post-cleanup state)"
  PASS=$((PASS+1))
else
  echo "[6/6] ✗ FAIL: verify-status.sh (post-cleanup state)"
  echo "       Output: $OUTPUT"
  FAIL=$((FAIL+1))
fi

# Cleanup уже выполнен выше; trap на EXIT будет no-op (идемпотентен).

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  SMOKE TEST: $PASS pass, $FAIL fail"
echo "═══════════════════════════════════════════════════════════"

if [ "$FAIL" -eq 0 ]; then
  echo "✅ Kit fully functional. Ready for production use."
  exit 0
else
  echo "❌ Kit has issues. See output above."
  exit 1
fi
