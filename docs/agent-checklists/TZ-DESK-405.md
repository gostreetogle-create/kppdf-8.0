# TZ-DESK-405 checklist

| Field | Value |
|-------|-------|
| Status | DONE |
| TZ | `tasks/TZ-DESK-405.md` |
| Prompt | `tasks/PROMPT-FREEBUFF-DESK-405.md` |
| Depends | DESK-401 DONE |
| Blocks | DESK-402, DESK-407 |
| Agent ID | `buffy-freebuff` |
| Claimed at | `2026-08-18T20:21:14+03:00` |
| Workspace | `D:\kppdf-8.0` |
| Team Room claim | unavailable — CLI not installed |

## Preflight

- [x] Workspace gate: `/d/kppdf-8.0`, `D:/kppdf-8.0`, branch `main`
- [x] `tasks/_active/` and active-map checked; no foreign active claim intersects the conflict keys
- [x] GEMINI.md, PO canon, TZ, page doc, design spec § PO review read
- [x] Claim slot filled before product-code edits
- [x] `tasks/_active/TZ-DESK-405.md` existed during implementation and was removed only after archive preparation

## PO acceptance

- [x] `app-pi-page-chrome` plus daily workflow strip: Стол, КП, Комбайн, disabled Гант stub, Снабжение, Отгрузка
- [x] Path crumbs show `Рабочий стол` and add the fixture order number on expand
- [x] One fixture row expands into `desk-order-tray` directly below that row; one-at-a-time toggle and `aria-expanded`
- [x] Legacy `__innards` / separate selected-order block removed
- [x] Queue scroll contract: `max-height: min(60vh, calc(100dvh - 8rem)); overflow-y: auto`
- [x] Left panels (`create`, `filter`, `summary`) render `data-side=left`; right panels render `data-side=right`
- [x] Tray contains gold rail, Заказ / Исполнение / Состав groups, fixture status/client/composition, disabled primary CTA, and Снабжение/Документы stubs
- [x] Esc closes only a flyout and leaves the expanded tray open
- [x] Fixture-only implementation; no `/api/orders`, order form, composition tree, Gantt embed, production-cockpit, or deploy changes

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: `page` — `/desk` layout only, no route contract change
- [x] FIC §A–E: N/A — no new route, permission, module/API, MCP, or shared write-path
- [x] `docs/pages/manager-desk.page.md` / PAGE-TZ-INDEX: N/A — existing `/desk` route contract already documents rev.2; this TZ changes only the fixture layout
- [x] SECTION-READINESS: N/A — no section readiness/status change
- [x] Чужой WIP не в коммите; conflict keys ограничены desk page/spec and optional tray
- [x] Coupling map: N/A — no shared field, status, filter, or domain write-path changed
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан и применён

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test -- --testPathPattern=manager-desk.page` — FAIL due repository script forwarding an extra `--` (Jest reported no matching tests)
- Equivalent direct gate `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=manager-desk.page` — PASS, 1 suite / 5 tests
- `cd frontend && pnpm exec eslint src/app/pages/desk/manager-desk.page.ts` — PASS
- Additional focused ESLint for extracted `desk-order-tray.component.ts` — PASS
- `git diff --check` on owned paths — PASS
- Advisory `prettier --check` reports existing project formatting differences in the three desk files; no typecheck, test, or ESLint errors

## Executor report

- Reworked `/desk` to the PO-reviewed rev.2 spatial grammar without touching `order-form-dialog`, `production-cockpit`, dashboard KPI, desktop, or routes.
- Added `desk-order-tray.component.ts` as the allowed optional conflict-key extraction; all data remains local fixture data.
- Foreign WIP remains unstaged and untouched. No deploy/wipe/production command was run.
- Live browser smoke was not run because no dedicated server was started; focused Angular DOM specs cover the clickable layout and query/keyboard behavior.

## Closeout

- [x] Archive prepared: `tasks/_archive/2026-08/TZ-DESK-405.done.md`
- [x] Lock prepared: `.mimocode/locks/TZ-DESK-405.lock`
- [x] `_NOW` updated; no root `progress.md` edit because it is outside the owned conflict paths and contains foreign WIP
- [x] Active task removed after archive preparation
- [x] Status = DONE
- closed_at: `2026-08-18T20:26:03+03:00`
