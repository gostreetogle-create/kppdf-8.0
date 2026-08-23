# TZ-UI-DEN-501: CSS tokens — paper levels + hint/warn/error

PAGES: (global)
PAGE_DOCS: foundations.page.md ; ui-density-canon.md

РОЛЬ АГЕНТА: Frontend CSS Architect

ЗАВИСИМОСТИ: Нет (фундамент — выполняется ПЕРВЫМ в волне DEN)

LAYER: 1

CONFLICT KEYS: frontend/src/styles.css; docs/design-spec.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: `frontend/src/styles.css`; `docs/ui-density-canon.md`; `docs/design-spec.md`.

1. `--text-label` = 13px (table th) — ок; density canon field labels = 11px eyebrow (FormField).
2. Три уровня фона описаны в canon (`#fbf9f6` / `#f3f1ee` / `#ffffff`) — в CSS частично через `bg-paper`, `bg-paper-2`, `bg-paper-raised`; возможны пробелы.
3. Hint/warn/error цвета для density (gold `#904d00`, amber `#7c5800`, red `#ba1a1a`) — не все как named tokens/utilities.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Добавить/выровнять CSS custom properties

- `--color-hint-ai: #904d00` (или OKLCH эквивалент в стиле файла)
- `--color-hint-success: #1b6c37` / alias на `--workshop-teal`
- `--color-hint-warn: #7c5800`
- `--color-hint-error: #ba1a1a`
- `--surface-plaque: #f3f1ee` (плашка file bar / config row) — если нет alias

ШАГ 2: Tailwind `@theme` / utilities

- `@utility text-hint-ai`, `text-hint-warn`, `text-hint-success` (10–11px через `text-xs` + color)
- `gap-form-row` / `gap-form-field`: label→value **4px** (canon); не ломать существующие form-section если conflict — document in migration note

ШАГ 3: Docs sync

- `design-spec.md`: одна строка «density hint tokens → styles.css :root»
- `/kit/foundations` demo page: показать 3 paper levels + hint colors (read-only snippet)

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `frontend/src/styles.css`
- `frontend/src/app/pages/kit/foundations/` (если есть секция colors — добавить swatch)
- `docs/design-spec.md` (tokens table only)

НЕ ИЗМЕНЯТЬ:
- feature pages
- backend

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `:root` содержит hint/warn/error/plaque tokens; grep `904d00|7c5800|f3f1ee` в styles.css
- [ ] Нет новых raw `#hex` в feature-коде (этот TZ — только styles + kit)
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] `cd frontend && pnpm lint` PASS (changed files)
- [ ] AC guard: `grep -E 'color-hint|surface-plaque' frontend/src/styles.css` ≥4 matches

Proof of adoption: kit/foundations swatch + migration note в archive `.done.md`.
