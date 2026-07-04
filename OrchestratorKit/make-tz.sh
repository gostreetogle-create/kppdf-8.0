#!/usr/bin/env bash
# make-tz.sh — 1-line TZ generator
#
# Usage:
#   bash make-tz.sh "My new feature"
#   bash make-tz.sh "My new feature" --layer 2 --deps "TZ-00" --keys "src/foo.ts;src/bar.ts"
#
# Что делает:
#   1. Находит следующий свободный TZ-NN (после существующих TZ-*.txt)
#   2. Копирует шаблон → TZ-NN.txt с заполненным заголовком
#   3. Опционально заполняет LAYER / ЗАВИСИМОСТИ / CONFLICT KEYS
#   4. Добавляет строку в ⏳ READY STATUS.md
#   5. Выводит инструкцию для handoff'а агенту

set -euo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"

TITLE="${1:-}"
shift || true
LAYER=""
DEPS=""
KEYS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --layer) LAYER="$2"; shift 2 ;;
    --deps)  DEPS="$2"; shift 2 ;;
    --keys)  KEYS="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 \"TZ title\" [--layer N] [--deps \"TZ-NN\"] [--keys \"file1;file2\"]"
      echo ""
      echo "Примеры:"
      echo "  $0 \"Build user auth with JWT\""
      echo "  $0 \"Add products filter\" --layer 2"
      echo "  $0 \"Refactor admin.component\" --layer 3 --deps TZ-03 --keys \"admin.component.ts;admin.component.html\""
      exit 0
      ;;
    *)
      echo "❌ Unknown arg: $1" >&2
      echo "   Run '$0 --help' for usage." >&2
      exit 1
      ;;
  esac
done

if [ -z "$TITLE" ]; then
  echo "❌ Title обязателен." >&2
  echo "   Usage: $0 \"My new feature\"" >&2
  echo "   Or:    $0 --help" >&2
  exit 1
fi

# Найти следующий TZ-NN
LAST=$(ls -1 "$SCRIPT_DIR"/TZ-*.txt 2>/dev/null \
  | grep -oE 'TZ-[0-9]+' \
  | sort -u \
  | tail -1 \
  | sed 's/TZ-//' \
  || echo "0")

if [ -z "$LAST" ]; then
  LAST=0
fi

NEXT=$((10#$LAST + 1))
TZ_NAME=$(printf "TZ-%02d" "$NEXT")
TARGET="$SCRIPT_DIR/${TZ_NAME}.txt"

# Скопировать шаблон и заполнить заголовок
TEMPLATE="$SCRIPT_DIR/_templates/TZ-template.txt"
if [ ! -f "$TEMPLATE" ]; then
  echo "❌ Template не найден: $TEMPLATE" >&2
  exit 1
fi

cp "$TEMPLATE" "$TARGET"

# sed_escape: экранирует спецсимволы для sed replacement (&, |, /, \).
# AUDIT-FIX: | добавлен в char class — sed-substitution ниже использует `|` как
# delimiter (s|...|...|), и без экранирования `|` в input sed парсил бы
# лишние пары pattern/replacement → `unknown option to 's'`.
sed_escape() { printf '%s\n' "$1" | sed 's/[&|\/]/\\&/g'; }

# Title (может содержать —, эмодзи, спецсимволы — sed delimiter `|`)
TITLE_ESCAPED=$(sed_escape "$TITLE")
sed -i "s|TZ-NN: \[КРАТКОЕ НАЗВАНИЕ — 3-6 СЛОВ\]|TZ-${NEXT}: ${TITLE_ESCAPED}|" "$TARGET"

# Опционально LAYER (одна цифра)
if [ -n "$LAYER" ]; then
  if ! [[ "$LAYER" =~ ^[1-4]$ ]]; then
    echo "❌ --layer должен быть 1/2/3/4, получено: $LAYER" >&2
    rm "$TARGET"
    exit 1
  fi
  # FIX: паттерн содержит `|` (в строке `1 | 2 | 3 | 4`), который также
  # является sed-delimiter'ом — sed парсил бы как 4 пары pattern/replacement
  # и падал с `unknown option to 's'`. Меняем delimiter на `#` для этой строки.
  sed -i "s#LAYER: \[1 | 2 | 3 | 4\]   ← ОБЯЗАТЕЛЬНО#LAYER: ${LAYER}   ← ОБЯЗАТЕЛЬНО#" "$TARGET"
fi

# Опционально ЗАВИСИМОСТИ
if [ -n "$DEPS" ]; then
  DEPS_ESCAPED=$(sed_escape "$DEPS")
  sed -i "s|ЗАВИСИМОСТИ: \[другие TZ-NN|ЗАВИСИМОСТИ: ${DEPS_ESCAPED}|" "$TARGET"
fi

# Опционально CONFLICT KEYS
if [ -n "$KEYS" ]; then
  KEYS_ESCAPED=$(sed_escape "$KEYS")
  sed -i "s|admin.component.html; admin.component.ts; styles.css|${KEYS_ESCAPED}|" "$TARGET"
fi

# Добавить строку в ⏳ READY STATUS.md
STATUS="$SCRIPT_DIR/STATUS.md"
if [ ! -f "$STATUS" ]; then
  echo "⚠️  WARN: STATUS.md не найден, строка не добавлена. Создайте его вручную."
else
  KEYS_DISPLAY="${KEYS:-TBD}"
  DEPS_DISPLAY="${DEPS:-Нет}"
  ROW="| ${TZ_NAME} | ${TITLE} | ${KEYS_DISPLAY} | ${DEPS_DISPLAY} |"

  # Найти divider line (|----|...) внутри ⏳ READY секции
  DIV=$(awk '
    /^## .*READY/ { in_ready=1; next }
    in_ready && /^\|[-\s|]+\|/ { print NR; exit }
  ' "$STATUS")

  if [ -n "$DIV" ]; then
    sed -i "${DIV}a\\${ROW}" "$STATUS"
  else
    echo "⚠️  WARN: не нашёл divider line в ⏳ READY. Добавьте строку вручную:"
    echo "   $ROW"
  fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ${TZ_NAME}.txt создан: $TARGET"
echo "✅ STATUS.md обновлён (${TZ_NAME} в ⏳ READY)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Следующие шаги:"
echo "   1. Открой ${TZ_NAME}.txt и заполни оставшиеся секции:"
echo "      • ИСХОДНОЕ СОСТОЯНИЕ (что есть сейчас)"
echo "      • ЧТО ДЕЛАТЬ (2-5 конкретных шагов)"
echo "      • КРИТЕРИИ ПРИЁМКИ (3-5 измеримых пунктов)"
[ -z "$LAYER" ] && echo "      • LAYER: 1 / 2 / 3 / 4 (ОБЯЗАТЕЛЬНО)"
[ -z "$DEPS" ] && echo "      • ЗАВИСИМОСТИ: TZ-NN или «Нет»"
[ -z "$KEYS" ] && echo "      • CONFLICT KEYS: файлы которые трогаешь"
echo ""
echo "   2. Передай агенту:"
echo "      «Прочитай $SCRIPT_DIR/AGENTS.md и ${TARGET},"
echo "        затем выполни ${TZ_NAME}.»"
echo ""
echo "   3. После выполнения агент запустит auto-archive.sh."
