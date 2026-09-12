# TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE checklist

> Status: **DONE**
> Wave: `docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md` (#3/4)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T20:19:40Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance (из TZ)

- [x] Оператор на пустой «+ Таблица» (без dataSource) видит «Нет источника строк — в Свойствах выберите витрину или нажмите «Вставить таблицу» в Выбрано»
- [x] Wired catalog/КП/заказ с пустыми строками видит другой текст: «Нет строк из источника — проверьте Выбрано / КП / заказ» (без «Свойствах»)
- [x] Не путает с «Нет фото» в фото-ячейке (отдельная ветка, не тронута)
- [x] Specs на оба текста + nx build green

## Gates (факт)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `pnpm exec nx test kppdf-web` → 121 suites / 843 tests PASS (3 new: 2 in `studio-table-defaults.spec.ts`, 1 new + 1 updated in `studio-blocks-canvas.component.spec.ts`)
- `pnpm exec nx build kppdf-web` → exit 0, same pre-existing budget warnings as baseline

## Executor report

- New: `studioTableEmptyStateLabel` (+ two exported label constants) in `studio-table-defaults.ts`, reusing existing `studioTableRowSource`.
- `studio-blocks-canvas.component.ts`: `@empty` branch now calls `tableEmptyStateLabel(block)` instead of a hardcoded string.
- Updated pre-existing `studio-blocks-canvas.component.spec.ts` assertion (text changed for the manual/no-source case) + added a wired-empty-source case; added direct unit tests in `studio-table-defaults.spec.ts`.
- `docs/pages/document-studio.page.md` — one-liner in the S45 "Таблицы на холсте" paragraph.
- Did not touch the photo-cell "Нет фото" branch (separate, TZ-NX-PO-SWEEP-05) or auto-wire any manual table.
