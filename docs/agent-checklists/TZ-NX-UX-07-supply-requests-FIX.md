# TZ-NX-UX-07-supply-requests-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-07-supply-requests-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T17:17:54Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-supply-requests-audit.md`, `/orders`/`/shipping`/`/supply` expand-in-row fixes (precedent), `supply-request-formatters.ts` (reuse `formatSupplyRequestPriority`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-07-supply-requests-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.page.ts`, `supply-requests.page.spec.ts`, `supply-request-form-dialog.component.ts`, `registries/data/supply-request-formatters.ts`, `docs/pages/supply.page.md`
- **Key Constraints:** only P1+P2 from audit; whole `**supply-request**` scope; no BE/money-ledger changes; reuse existing formatters, don't invent new label mappings
- **Planned Deliverable:** expand-in-row (priority/paidAt/receivedQty/deliveryNote/notes/neededBy read-only) + 4 underline actions → `.pi-outline-btn`
- **Validation Path:** new specs for expand behavior, `nx build kppdf-web` last, visual note in report

## Acceptance

- [x] All P0/P1 from audit closed (T1 fixed) or explicitly DEFERRED with reason (none deferred; P2 also fixed, all 4 instances).
- [x] No underline-as-primary-action left for row tools (all 4 instances converted to `.pi-outline-btn`).
- [x] Expand/detail pattern matches registries where applicable (same hand-rolled pattern as `/orders`/`/shipping`/`/supply`).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, new read-only expand view + copy-only chip fixes, no new route/permission)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route enhanced in place
- [x] page.md / PAGE-TZ-INDEX: **ADDED** — `docs/pages/supply.page.md` § `TZ-NX-SUPPLY-S3-REQUEST-JOURNAL` UI note
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`pages/supply-requests/**`, `docs/pages/supply.page.md`, audit closeout, WAVE row 07, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (read-only expand of existing fields, no shared status/FK field semantics changed)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 687 passed (685 baseline + 2 new) / 7 pre-existing skipped / 694 total, 0 regressions
                                                     incl. supply-requests.page.spec.ts 11/11 (9 existing + 2 new) and supply-request-form-dialog.component.spec.ts 10/10 (unmodified)
```

## Executor report

- **P1 fixed (T1):** `supply-requests.page.ts` rows now expand-in-row (click/Enter/Space,
  `tabindex="0"`, `aria-expanded`) showing Приоритет / Нужно к дате / Дата оплаты / Получено
  (факт) / Доставка / Примечание read-only — reused the existing `formatSupplyRequestPriority`
  helper rather than inventing a new label mapping. Order-link and row-actions cells get
  `(click)="$event.stopPropagation()"`. `expandedId` resets on `load()`.
- **P2 fixed (A1), all 4 instances:** toolbar «Сбросить фильтры» (both variants — always-visible
  and empty-state) and form-dialog «Очистить»/«Копировать и изменить» all converted from
  underline text to `.pi-outline-btn`.
- **Specs added:** `supply-requests.page.spec.ts` — expand shows priority/paidAt/receivedQty/
  deliveryNote/notes and collapses on second click; row-action click does not toggle expand. The
  second test needed no `whenStable()` wait (unlike `/supply`'s #06 fix) — `openEdit()` here only
  opens a dialog synchronously; `load()` isn't called until the dialog closes with a saved result,
  which the mock never triggers, so no async race to guard against.
- No BE fields invented, no second write-path, no other route touched, no money-ledger logic
  touched (all shown fields were already fetched by `list()`, just not rendered).
- `docs/pages/supply.page.md` — NX UX note added under `TZ-NX-SUPPLY-S3-REQUEST-JOURNAL` § UI.
- Visual note: not run against a live dev server this session (no `pnpm serve` instance up);
  verified via `nx build` (full AOT template compile) + full kppdf-web jest suite green, including
  the two new expand-specific tests and the unmodified form-dialog spec (confirming the 2
  underline→`.pi-outline-btn` swaps there didn't break any existing assertion).
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.page.ts` (fix),
  `supply-requests.page.spec.ts` (2 new tests + fixture row extended with new fields),
  `supply-request-form-dialog.component.ts` (2 button class fixes), `docs/pages/supply.page.md`
  (NX UX note), `docs/audits/2026-09-09-nx-ux-supply-requests-audit.md` (closeout appended),
  `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 07 DONE), `docs/agent-checklists/_NOW.md`
  (Claude IDLE), `docs/agent-checklists/TZ-NX-UX-07-supply-requests-FIX.md` (this file),
  `tasks/_active/TZ-NX-UX-07-supply-requests-FIX.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate (нет отдельного review inbox для этой волны); gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T17:35:00Z
