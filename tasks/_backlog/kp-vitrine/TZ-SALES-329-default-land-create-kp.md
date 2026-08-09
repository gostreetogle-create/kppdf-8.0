# TZ-SALES-329: Сделки → КП — по умолчанию «Создать КП» (левый chip)

PAGES: /proposals/create ; /proposals  
PAGE_DOCS: proposals-create.page.md ; proposals.page.md  
Зависит от: нет (тонкий nav); можно после archive 323 или ∥ 324 (keys разные)

РОЛЬ АГЕНТА: frontend  
ЗАВИСИМОСТИ: нет  
LAYER: 2  
CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts; frontend/src/app/pages/commercial/deals-group-chips.ts; frontend/src/app/pages/commercial/deals-group-chips.spec.ts; docs/pages/proposals-create.page.md

Проверено: жёлтые chips уже слева→направо `Создать КП` → `Все КП` (`deals-group-chips.ts` 16–18); вход Сделки/`КП` ведёт на `/proposals` (`app-layout.component.ts` entryPath + TOC path) → активен правый chip «Все КП». Клиент = Counterparty N/A.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO: при входе в Сделки → КП по умолчанию должна гореть **левая** жёлтая кнопка «Создать КП», не «Все КП».
2. Порядок chips уже правильный; ломается **landing route**.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. `SECTION_NAV` deals: `entryPath: '/proposals/create'`.
2. TOC chip «КП»: `route` / `path` → `/proposals/create` (чтобы клик по тёмному «КП» тоже открывал студию).
3. Жёлтый «Все КП» остаётся `/proposals` (журнал).
4. Jest: deals-group-chips + при наличии layout/nav spec — entry = create.
5. Одна строка в page docs / WAVE: default land = Создать КП.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Shell 317 / build preview / 323–328 product logic
- Порядок labels chips (уже create→all)
- deploy

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Клик «Сделки» или TOC «КП» → URL `/proposals/create`, жёлтый chip «Создать КП» active.
2. Клик «Все КП» → `/proposals`, chip «Все КП» active.
3. Gates: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` + `pnpm test -- --testPathPattern=deals-group-chips`

Финализация: `tasks/_archive/2026-08/TZ-SALES-329.done.md`.
