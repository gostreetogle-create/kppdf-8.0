# TZ-UX-440R: хвост UX-440 — «Почта менеджера» + hex fallbacks

PAGES: `/supply`
PAGE_DOCS: supply.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: нет (disjoint с DOC-443 / KP-443)  
LAYER: 3  
SIZE: micro (~15 мин)

### Preflight Check Output
- **Context read:** `supply-quick-order.component.ts` L631 уже «Почта менеджера» (WIP Claude MCP); hex fallbacks L1233+ ломают pre-commit `no-raw-ui-values`
- **Key Constraints:** только этот файл; не трогать logic/API
- **Planned Deliverable:** commit label + drop `#hex` в `var(--token, #hex)`
- **Validation Path:** tsc + jest supply-quick-order

CONFLICT KEYS:
`frontend/src/app/pages/supply/supply-quick-order.component.ts`;
`frontend/src/app/pages/supply/supply-quick-order.component.spec.ts` (если assertion)

## ИСХОДНОЕ

1. Лейбл «Email менеджера» → уже заменён на «Почта менеджера» в рабочей копии (проверить grep).
2. Pre-commit падает на raw hex в styles того же файла:
   - `var(--color-sunrise-warm, #c79542)` и аналоги → оставить только `var(--…)`
   - `color-mix(..., #000000)` → `var(--color-ink)` (или канон из `styles.css`)

## ЧТО ДЕЛАТЬ

1. Убедиться: user-visible «Почта менеджера», нет «Email менеджера».
2. Убрать все `#hex` fallbacks в styles этого компонента (token-only).
3. Обновить spec, если есть assertion на Email.
4. Gates + commit: `fix(ux): RU Почта менеджера; drop hex fallbacks in supply-quick-order`

## НЕ ИЗМЕНЯТЬ

- DOC-443 / KP-443 / desk / shipping / backend
- Поведение формы снабжения

## КРИТЕРИИ ПРИЁМКИ

1. Grep: нет `Email менеджера` в supply-quick-order.
2. `pnpm lint` / pre-commit на файле PASS (no-raw-ui-values).
3. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
4. `cd frontend && pnpm exec jest src/app/pages/supply/supply-quick-order.component.spec.ts --no-coverage --runInBand`

## Archive

`tasks/_archive/2026-08/` + checklist.
