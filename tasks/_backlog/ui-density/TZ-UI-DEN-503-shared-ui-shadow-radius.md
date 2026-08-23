# TZ-UI-DEN-503: shared/ui — shadow & radius anti-pattern sweep

PAGES: (global)
PAGE_DOCS: ui-density-canon.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-501

LAYER: 2

CONFLICT KEYS: frontend/src/app/shared/ui/**/*.ts; frontend/src/app/shared/ui/**/*.css

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Canon: `box-shadow: none` на панелях/таблицах; `rounded-sm` max на interactive; `executive-shadow` только на канонических кнопках.

Grep ожидает hits в dialog (allowed `--dialog-shadow`), button (allowed).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Audit grep в `shared/ui/`

```bash
cd frontend/src/app/shared/ui && rg 'shadow-|rounded-md|rounded-lg|rounded-xl|rounded-2xl' -g '*.ts'
```

ШАГ 2: Fix только primitives (table, sheet chrome, card shells, skeleton, pagination)

- `shadow-*` → remove или `hairline` border
- `rounded-md+` → `rounded-sm` (interactive) или `rounded-none` (structural)

ШАГ 3: Не трогать PiDialog backdrop shadow token

ШАГ 4: Обновить `/kit/overview` migration note «anti-patterns fixed in DEN-503»

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `frontend/src/app/pages/**` (page sweeps — отдельные TZ)
- Gantt / production custom visuals

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] AC guard: `rg 'rounded-(md|lg|xl|2xl)' frontend/src/app/shared/ui -g '*.ts'` → 0 (except documented exceptions in .done.md)
- [ ] AC guard: no new `shadow-sm/md/lg` on table/sheet/pagination components
- [ ] tsc + lint + tests for touched components PASS
