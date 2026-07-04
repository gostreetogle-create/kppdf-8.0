#!/usr/bin/env bash
# kit-doctor.sh — диагностика проблем с kit'ом с человеко-понятными советами
#
# Usage:
#   bash kit-doctor.sh
#
# Что делает:
#   1. Запускает verify-status.sh
#   2. Парсит FAIL/WARN сообщения
#   3. Выводит конкретные команды для исправления

set -uo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"

echo "🏥 Kit Doctor — диагностика OrchestratorKit"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Шаг 1: запускаю verify-status.sh..."
echo ""

OUTPUT=$(bash "$SCRIPT_DIR/verify-status.sh" 2>&1 || true)
echo "$OUTPUT"
echo ""

if echo "$OUTPUT" | grep -q "PASS:"; then
  echo "═══════════════════════════════════════════════════════════"
  echo "✅ Kit в порядке. Никаких расхождений не обнаружено."
  echo "═══════════════════════════════════════════════════════════"
  exit 0
fi

echo "═══════════════════════════════════════════════════════════"
echo "❌ Обнаружены проблемы. Конкретные советы:"
echo "═══════════════════════════════════════════════════════════"
echo ""

advised=0

# ───── FAIL: TZ в корне, нет упоминания в READY ─────
if echo "$OUTPUT" | grep -qE "FAIL \[FWD\]:.*в корне kit-а"; then
  echo "🔍 TZ-файл в корне, но не упомянут в ⏳ READY STATUS.md"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс 1 (рекомендуемый): добавьте строку в ⏳ READY вручную:"
  echo '     | TZ-NN | <название> | <CONFLICT KEYS> | <зависит> |'
  echo ""
  echo "   Фикс 2 (быстрый):"
  echo "     bash $SCRIPT_DIR/make-tz.sh \"<название>\""
  echo "     (это пересоздаст TZ-NN.txt + добавит строку в READY)"
  echo ""
  advised=$((advised+1))
fi

# ───── FAIL: TZ в _active/, нет упоминания в IN WORK ─────
if echo "$OUTPUT" | grep -qE "FAIL \[FWD\]:.*_active/.*IN WORK"; then
  echo "🔍 TZ в _active/ не упомянут в 🔥 IN WORK STATUS.md"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс: добавьте строку в 🔥 IN WORK вручную:"
  echo '     | TZ-NN | <название> | <CONFLICT KEYS> | <дата старта> |'
  echo "   (Или: пусть агент обновит STATUS.md при ШАГ 0.)"
  echo ""
  advised=$((advised+1))
fi

# ───── FAIL: TZ в READY, но .txt не в корне ─────
if echo "$OUTPUT" | grep -qE "FAIL \[REV\]:.*READY.*\.txt в корне"; then
  echo "🔍 TZ упомянут в ⏳ READY, но .txt-файл не в корне kit-а"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс 1 (файл потерян): удалите строку из ⏳ READY в STATUS.md"
  echo "   Фикс 2 (файл был, пересоздать):"
  echo "     bash $SCRIPT_DIR/make-tz.sh \"<то же название>\""
  echo ""
  advised=$((advised+1))
fi

# ───── FAIL: TZ в DONE, но .done.txt не в архиве ─────
if echo "$OUTPUT" | grep -qE "FAIL \[REV\]:.*DONE.*\.done.txt"; then
  echo "🔍 TZ упомянут в ✅ DONE, но нет .done.txt в _archive/"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс: переархивируйте автоматически:"
  echo "     bash $SCRIPT_DIR/auto-archive.sh TZ-NN done"
  echo "   (это пересоздаст .done.txt + lock file + обновит STATUS.md)"
  echo ""
  advised=$((advised+1))
fi

# ───── FAIL: TZ в FAILED, но .failed.txt не в архиве ─────
if echo "$OUTPUT" | grep -qE "FAIL \[REV\]:.*FAILED.*\.failed.txt"; then
  echo "🔍 TZ упомянут в ❌ FAILED, но нет .failed.txt в _archive/"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс:"
  echo "     bash $SCRIPT_DIR/auto-archive.sh TZ-NN failed"
  echo ""
  advised=$((advised+1))
fi

# ───── FAIL: TZ в _active/, нет в IN WORK (orphan agent) ─────
if echo "$OUTPUT" | grep -qE "FAIL \[FWD\]:.*_active/"; then
  echo "🔍 TZ-файл в _active/, но агент не обновил STATUS.md на 🔥 IN WORK"
  echo "   ─────────────────────────────────────────────"
  echo "   Скорее всего агент начал работу (ШАГ 0), но забыл обновить STATUS."
  echo "   Фикс: добавьте строку TZ в 🔥 IN WORK (см. выше)."
  echo ""
  advised=$((advised+1))
fi

# ───── FATAL: STATUS.md отсутствует ─────
if echo "$OUTPUT" | grep -qE "FATAL:.*STATUS.md отсутствует"; then
  echo "🔥 STATUS.md отсутствует!"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс: создайте его из шаблона:"
  echo "     cp $SCRIPT_DIR/_templates/STATUS-template.md $SCRIPT_DIR/STATUS.md"
  echo "   Или скопируйте из рабочего kit-а."
  echo ""
  advised=$((advised+1))
fi

# ───── WARN: секция отсутствует ─────
if echo "$OUTPUT" | grep -qE "WARN:.*секция.*отсутствует"; then
  echo "⚠️  STATUS.md не содержит всех 4 секций (READY/IN WORK/DONE/FAILED)"
  echo "   ─────────────────────────────────────────────"
  echo "   Фикс: откройте STATUS.md и добавьте недостающие секции по образцу:"
  echo "     ## 🔥 IN WORK (агенты работают прямо сейчас, файл в \`_active/\`)"
  echo "     *Пусто.*"
  echo "     ---"
  echo "     ## ⏳ READY (готовы к выдаче...)"
  echo "     *Пусто.*"
  echo "     ---"
  echo "     ## ✅ DONE (в \`_archive/<YYYY-MM>/TZ-NN.done.txt\`)"
  echo "     *Пусто.*"
  echo "     ---"
  echo "     ## ❌ FAILED ..."
  echo "     *Пусто.*"
  echo "     ---"
  echo ""
  advised=$((advised+1))
fi

# ───── Дополнительные проверки ─────

# Lock-файлы не в архиве
LOCK_COUNT=$(ls -1 "$SCRIPT_DIR/.mimocode/locks/" 2>/dev/null | wc -l)
if [ "$LOCK_COUNT" -gt 0 ]; then
  echo "ℹ️  Lock-файлов в .mimocode/locks/: $LOCK_COUNT"
  echo "   (это нормально; удаляйте вручную только если TZ потерян)"
  echo ""
fi

# Проверка: у всех ли .done.txt есть ARCHIVE_MARKER
for f in "$SCRIPT_DIR"/_archive/*/TZ-*.done.txt; do
  [ -f "$f" ] || continue
  if ! grep -q "ARCHIVE_MARKER" "$f"; then
    echo "⚠️  Archive file без ARCHIVE_MARKER: $f"
    echo "   (вероятно, старый формат — обновите вручную или пере-архивируйте)"
    advised=$((advised+1))
  fi
done

echo ""
if [ "$advised" -eq 0 ]; then
  echo "ℹ️  Конкретных советов не нашёл, но verify-status показал FAIL."
  echo "   Смотрите секцию «ВОССТАНОВЛЕНИЕ» в STATUS.md или прочитайте:"
  echo "     cat $SCRIPT_DIR/TROUBLESHOOTING.md"
fi

echo ""
echo "📖 Дополнительная помощь:"
echo "   - $SCRIPT_DIR/TROUBLESHOOTING.md (частые ошибки)"
echo "   - $SCRIPT_DIR/AGENTS.md §6 (самые частые грабли)"
exit 1
