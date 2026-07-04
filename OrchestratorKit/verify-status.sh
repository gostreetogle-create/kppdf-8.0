#!/usr/bin/env bash
# verify-status.sh — синхронизация STATUS.md ↔ файловая система kit-а
#
# Использование:
#   bash verify-status.sh              # проверяет kit относительно текущей папки
#
# Коды возврата:
#   0 = PASS (всё синхронизировано)
#   1 = FAIL (найдены расхождения)
#   2 = FATAL (STATUS.md отсутствует)
#
# Логика проверки (двухсторонняя):
#
#   🔽 FORWARD (filesystem → STATUS.md section):
#     - TZ-NN.txt в корне kit-а        → Ожидаем ≥1 упоминания в ⏳ READY
#     - TZ-NN.txt в _active/           → Ожидаем ≥1 упоминания в 🔥 IN WORK
#     - TZ-NN.done.txt в _archive/     → Ожидаем ≥1 упоминания в ✅ DONE
#     - TZ-NN.failed.txt в _archive/   → Ожидаем ≥1 упоминания в ❌ FAILED
#
#   🔼 REVERSE (STATUS.md primary row → filesystem):
#     - TZ-NN в ⏳ READY (primary col)   → Ожидаем TZ-NN.txt в корне kit-а
#     - TZ-NN в 🔥 IN WORK (primary)    → Ожидаем TZ-NN.txt в _active/
#     - TZ-NN в ✅ DONE (primary)       → Ожидаем TZ-NN.done.txt в _archive/
#     - TZ-NN в ❌ FAILED (primary)     → Ожидаем TZ-NN.failed.txt в _archive/

# FIX 1: ASCII-only regex для кросс-платформенной работы.
# Заголовки секций в STATUS.md имеют уникальные ASCII-якоря в конце:
#   ## ⏳ READY (готовы...)
#   ## 🔥 IN WORK (агенты работают...)
#   ## ✅ DONE (в _archive...)
#   ## ❌ FAILED (нужен пере-выпуск...)
# Совпадение идёт по `^## .*<ASCII-якорь>` — никаких эмодзи в regex.

set -euo pipefail
shopt -s nullglob

# Auto-detect: путь скрипта → корень kit-а.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"
KIT_ROOT="${1:-$(pwd)}"
STATUS="$SCRIPT_DIR/STATUS.md"

# FIX 4: bootstrap структуры каталогов. Безопасно если уже есть.
mkdir -p "$SCRIPT_DIR/_active" "$SCRIPT_DIR/_archive" 2>/dev/null || true
mkdir -p "$SCRIPT_DIR/_archive/$(date +%Y-%m)" 2>/dev/null || true

if [ ! -f "$STATUS" ]; then
  echo "FATAL: STATUS.md отсутствует по пути $STATUS"
  echo "       Скрипт должен жить в корне kit-а рядом с STATUS.md."
  echo "       Если kit лежит в подпапке проекта, передайте путь явно."
  exit 2
fi

# ──── Утилиты ────

# FIX 1: ищет секцию по ASCII-якорю в конце заголовка (без эмодзи в regex).
#   $1 = ASCII-якорь: "READY" | "IN_WORK" | "DONE" | "FAILED"
section() {
  local anchor="$1"
  local pattern
  case "$anchor" in
    READY)    pattern='^## .*READY[[:space:]]' ;;
    IN_WORK)  pattern='^## .*IN WORK' ;;
    DONE)     pattern='^## .*DONE[[:space:]]' ;;
    FAILED)   pattern='^## .*FAILED[[:space:]]' ;;
    *)        echo "BUG: неизвестный anchor '$anchor'" >&2; return 1 ;;
  esac
  local start_line
  # FIX Q4 (regression от set -e): на отсутствующей секции grep вернёт 1,
  # pipefail считает pipeline проваленным, set -e абортнет скрипт ДО guard.
  # Добавляем `|| echo ""` чтобы пустое содержимое обрабатывалось gracefully.
  start_line=$(grep -nE "$pattern" "$STATUS" 2>/dev/null | head -1 | cut -d: -f1 || echo "")
  if [ -z "$start_line" ]; then
    return 0
  fi
  local end_line
  end_line=$(awk -v s="$start_line" 'NR > s && /^## / { print NR; exit }' "$STATUS")
  if [ -z "$end_line" ]; then
    sed -n "${start_line},\$p" "$STATUS"
  else
    sed -n "${start_line},$((end_line - 1))p" "$STATUS"
  fi
}

# Считает упоминания TZ-NN в секции (для FORWARD checks — допустимо любое упоминание).
mention_count() {
  local word="$1" sect_anchor="$2"
  local content
  content=$(section "$sect_anchor")
  if [ -z "$content" ]; then
    echo 0
    return
  fi
  local n
  n=$(printf '%s\n' "$content" | grep -cE "(^|[|[:space:]])${word}([|[:space:]]|\\$)" 2>/dev/null) || n=0
  echo "$n"
}

# FIX 4: извлекает ТОЛЬКО primary-column TZs (для REVERSE checks — игнорирует
# зависимости в последней колонке таблицы). Шаблон `^\| TZ-NN` соответствует
# только первому столбцу строки таблицы.
extract_primary_tzs() {
  local sect_anchor="$1"
  local content
  content=$(section "$sect_anchor")
  if [ -z "$content" ]; then
    return 0
  fi
  # FIX: sed использовал BRE (по умолчанию) с ERE-паттерном `^\|` — в BRE
  # `\|` это alternation, не literal pipe, поэтому `s/^\| //` вставляло
  # лишний пробел в начале строки вместо удаления `| `. Результат: ` TZ-97`
  # вместо `TZ-97` → `[ ! -f "$SCRIPT_DIR/ TZ-97.txt" ]` → REV FAIL.
  # Флаг -E включает ERE, в котором `\|` — литерал `|`, плюс пустая
  # замена (не пробел) корректно отрезает leading `| `.
  printf '%s\n' "$content" | grep -oE '^\| TZ-[0-9]+' | sed -E 's/^\| //' | sort -u
}

errs=0
warns=0

# ──── FORWARD: filesystem → STATUS.md ────

# TZ-NN.txt в корне kit-а → ⏳ READY (≥1 вхождение)
for f in "$SCRIPT_DIR"/TZ-*.txt; do
  [ -f "$f" ] || continue
  tz=$(basename "$f" .txt)
  n=$(mention_count "$tz" "READY")
  if [ "$n" -lt 1 ]; then
    echo "FAIL [FWD]: $tz в корне kit-а, ожидаем ≥1 упоминания в ⏳ READY, получили $n"
    errs=$((errs+1))
  fi
done

# TZ-NN.txt в _active/ → 🔥 IN WORK (≥1)
for f in "$SCRIPT_DIR"/_active/TZ-*.txt; do
  [ -f "$f" ] || continue
  tz=$(basename "$f" .txt)
  n=$(mention_count "$tz" "IN_WORK")
  if [ "$n" -lt 1 ]; then
    echo "FAIL [FWD]: $tz в _active/, ожидаем ≥1 упоминания в 🔥 IN WORK, получили $n"
    errs=$((errs+1))
  fi
done

# TZ-NN.done.txt в _archive/YYYY-MM/ → ✅ DONE (≥1)
for f in "$SCRIPT_DIR"/_archive/*/TZ-*.done.txt; do
  [ -f "$f" ] || continue
  tz=$(basename "$f" .done.txt)
  n=$(mention_count "$tz" "DONE")
  if [ "$n" -lt 1 ]; then
    echo "FAIL [FWD]: ${tz}.done.txt в архиве, ожидаем ≥1 упоминания в ✅ DONE, получили $n"
    errs=$((errs+1))
  fi
done

# TZ-NN.failed.txt в _archive/YYYY-MM/ → ❌ FAILED (≥1)
for f in "$SCRIPT_DIR"/_archive/*/TZ-*.failed.txt; do
  [ -f "$f" ] || continue
  tz=$(basename "$f" .failed.txt)
  n=$(mention_count "$tz" "FAILED")
  if [ "$n" -lt 1 ]; then
    echo "FAIL [FWD]: ${tz}.failed.txt в архиве, ожидаем ≥1 упоминания в ❌ FAILED, получили $n"
    errs=$((errs+1))
  fi
done

# ──── REVERSE: STATUS.md primary row → filesystem ────

while IFS= read -r tz; do
  [ -z "$tz" ] && continue
  if [ ! -f "$SCRIPT_DIR/${tz}.txt" ]; then
    echo "FAIL [REV]: $tz в ⏳ READY (primary), но нет ${tz}.txt в корне kit-а"
    errs=$((errs+1))
  fi
done < <(extract_primary_tzs "READY")

while IFS= read -r tz; do
  [ -z "$tz" ] && continue
  if [ ! -f "$SCRIPT_DIR/_active/${tz}.txt" ]; then
    echo "FAIL [REV]: $tz в 🔥 IN WORK (primary), но нет ${tz}.txt в _active/"
    errs=$((errs+1))
  fi
done < <(extract_primary_tzs "IN_WORK")

while IFS= read -r tz; do
  [ -z "$tz" ] && continue
  if ! ls "$SCRIPT_DIR"/_archive/*/"${tz}.done.txt" > /dev/null 2>&1; then
    echo "FAIL [REV]: $tz в ✅ DONE (primary), но нет ${tz}.done.txt ни в одном _archive/<YYYY-MM>/"
    errs=$((errs+1))
  fi
done < <(extract_primary_tzs "DONE")

while IFS= read -r tz; do
  [ -z "$tz" ] && continue
  if ! ls "$SCRIPT_DIR"/_archive/*/"${tz}.failed.txt" > /dev/null 2>&1; then
    echo "FAIL [REV]: $tz в ❌ FAILED (primary), но нет ${tz}.failed.txt в _archive/<YYYY-MM>/"
    errs=$((errs+1))
  fi
done < <(extract_primary_tzs "FAILED")

# ──── SOFT-CHECK: наличие самих секций в STATUS.md ────
# Вызываем section() — это та же логика, что и для forward/reverse.
# (Это дедуплицирует привязку к ASCII-якорям в одном месте.)

for sect_anchor in "READY" "IN_WORK" "DONE" "FAILED"; do
  if [ -z "$(section "$sect_anchor")" ]; then
    echo "WARN: секция с якорем '${sect_anchor}' отсутствует в STATUS.md"
    warns=$((warns+1))
  fi
done

# ──── ИТОГО ────

if [ "$errs" -eq 0 ]; then
  total=$(find "$SCRIPT_DIR" -maxdepth 2 -name 'TZ-*.txt' -type f 2>/dev/null | wc -l)
  echo ""
  echo "PASS: STATUS.md синхронизирован с файловой системой (проверено $total TZ-файлов, $warns warning(s))"
  exit 0
else
  echo ""
  echo "FAIL: $errs расхождений между STATUS.md и файловой системой."
  echo "       Запустите секцию «ВОССТАНОВЛЕНИЕ» из STATUS.md, чтобы"
  echo "       пересобрать файл из реального состояния каталога."
  exit 1
fi
