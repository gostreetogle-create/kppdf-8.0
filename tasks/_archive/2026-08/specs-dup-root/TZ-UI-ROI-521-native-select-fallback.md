═══════════════════════════════════════════════════════════════
TZ-UI-ROI-521: Native `<select>` = официальный Paper & Ink fallback
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend + docs (тонкий)
ЗАВИСИМОСТИ: TZ-UI-WR-501 DONE (если трогаешь `styles.css` / `--z-*` рядом)
LAYER: 2
CONFLICT KEYS: docs/paper-and-ink.md; docs/AI-AGENT-GUIDE.md; frontend/src/styles.css
  (только если добавляешь класс `.pi-native-select`; иначе docs-only)

PAGES: /kit/forms
PAGE_DOCS: (kit forms page)

Проверено: PO-CANON — native select ок до поиска 1000+; war-room — batch migrate
  PiSelect не в первой волне; PiOverflowSelect = длинные имена.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Агенты тратят часы на «красивый» select и ломают клавиатуру. Нужен канон:
короткий enum / ≤~20 опций без поиска = **native `<select>`**, визуально
подогнанный под токены; длинный searchable = OverflowSelect; не изобретать третий.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Docs (`paper-and-ink.md` + короткий абзац в `AI-AGENT-GUIDE.md` §UI):
  - Когда native / OverflowSelect / PiSelect.
  - ЗАПРЕТ: массовая миграция native→PiSelect без PO.
  - ЗАПРЕТ: кастомный absolute dropdown в feature-page «вместо select».

ШАГ 2 — Опционально (после 501): один utility-класс `.pi-native-select` в
  `styles.css` (border/radius/height/color = form control tokens). Без нового
  Angular-компонента.

ШАГ 3 — Passport-строка на `/kit/forms` (комментарий или секция): native select
  = approved fallback + класс если есть.

ШАГ 4 — Proof: docs + (если CSS) один пример класса на kit/forms; тест не обязателен
  для docs-only; при CSS — visual note в `.done.md`.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Не мигрировать 60+ native select в pages.
- Не трогать PiSelect API / manager-desk / proposal-create.
- Не Material MatSelect.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
(если только docs — `git diff --check`)

Finalization: `tasks/_archive/YYYY-MM/TZ-UI-ROI-521.done.md`
