# TZ-SUPPLY-315 DONE — Быстрый заказ: приведение к дизайн-системе (Paper & Ink)

```
ARCHIVE_MARKER
task_id: TZ-SUPPLY-315
outcome: DONE
closed_at: 2026-08-22T10:20:00+03:00
agent_id: claude
workspace: D:\kppdf-8.0
branch: main
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (28/28)
  - lint: PASS (0 errors)
  - supply-smoke: PASS (23/23)
  - browser visual pass: NOT RUN (no browser-automation tool in this session — disclosed, not claimed)
  - checklist: ADDED (docs/agent-checklists/TZ-SUPPLY-315.md)
  - progress.md: not touched (page-level frontend change, no architectural shift)
  - status synchronization: docs/agent-checklists/_NOW.md updated
```

## Источник

`docs/audits/2026-08-22-ui-consistency-audit.md` — D-01 (самодельный modal), S-02
(native `<select>` вместо `PiOverflowSelect`), T-03 (ad-hoc rem вместо токенов), все
три на `frontend/src/app/pages/supply/supply-quick-order.component.ts`.

## Что сделано

- Пять «+»-панелей (цвет/категория/материал/поставщик/менеджер) переведены с
  самодельного `role="dialog"` backdrop на `PiDialogService`/`app-pi-dialog`
  (новый internal `SupplyQuickOrderDialogComponent` — тонкая обёртка,
  `TemplateRef`-контент из родителя, чтобы не переписывать существующие
  `save*`/`cancel*` обработчики). Focus trap и Escape — из `PiDialogService`
  (CDK `ConfigurableFocusTrapFactory` + `keydownEvents`); доступное имя —
  через `aria-label`/`aria-modal` уже существующего `PiDialogComponent`.
- Native `<select>` материала/поставщика/категории заменены на
  `app-pi-overflow-select` (`categoryOptions()`, `materialOptions(categoryId)`,
  `supplierOptions(categoryId)`). Статус/приоритет и прочие короткие enum-списки
  (цвет, ед.изм., контакт, компания, «кто просил») намеренно оставлены native.
- Ad-hoc `font-size: 0.625–1.25rem` заменены на `--text-micro`/`--text-label`;
  3 оставшихся glyph-иконки в квадратных кнопках задокументированы одной
  строкой как compact-control exception (тем же паттерном, что уже был в файле).
- `supply-quick-order.component.spec.ts` адаптирован под CDK Overlay portal
  (`document.body.querySelector` вместо `root.querySelector` для диалогов) и
  добавлен helper `openOverflowOptions()` для чтения опций из overlay-списка;
  новый тест на закрытие диалога по Escape.

## Coordination note

Пока эта TZ выполнялась под claim `claude` (10:06:13+03:00), отдельный процесс
`freebuff` независимо освободил тот же checklist в 10:11:18+03:00 (причина:
конфликт conflict-key с `TZ-SUPPLY-314`, рекомендованный порядок — 314 первой) и
взял `TZ-SUPPLY-314` в `_active`. К моменту проверки код этой TZ уже был полностью
реализован и зелёным по gates — закрываю как DONE по факту готовой и проверенной
работы, не переигрывая. `TZ-SUPPLY-314` не трогалась (live claim другого агента на
том же файле, другой scope — guided collapse/auto-expand).

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- supply-quick-order` → PASS, 28/28
- `cd frontend && pnpm lint` → PASS, 0 errors
- `node scripts/smoke/supply-smoke.mjs` → PASS, 23/23

## Не сделано / известные ограничения

- Browser visual pass (5 dialogs + selects, light/dark) не выполнен — нет
  подключённого browser-automation инструмента в этой сессии. Полагаюсь на
  unit-покрытие (включая выделенный ESC-тест и CDK-overlay portal-ассерты).
- `PiDialogComponent`/`PiSelect` shared-компоненты не менялись (по scope TZ) —
  `aria-labelledby` буквально не добавлен, вместо него используется уже
  существующий `aria-label` контракт `PiDialogComponent`.
- `TZ-UI-401`/`TZ-UI-402` (shared `PiSelect`, gold/paper contrast) — отдельные
  задачи, не дублировались.
