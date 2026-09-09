# TZ-NX-UX-06-supply-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-06-supply-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T17:01:05Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-supply-audit.md`, `/shipping` expand-in-row fix (precedent), `backend/src/modules/supply/supply-task.schema.ts` (confirmedBy type check)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-06-supply-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts`, `supply.page.spec.ts`, `frontend-nx/libs/data-access/src/lib/supply/supply-task.types.ts`, `backend/src/modules/supply/supply-task.schema.ts` (verify confirmedBy is a raw ObjectId, not populated), `docs/pages/supply.page.md`
- **Key Constraints:** only P1+P2 from audit; single file `supply.page.ts`; no BE/money-ledger changes; never display a raw ObjectId as user copy (D1 principle)
- **Planned Deliverable:** expand-in-row (orderLineId/confirmedAt/notes read-only, confirmedBy deliberately omitted) + chip button → `.pi-outline-btn`
- **Validation Path:** new specs for expand behavior, `nx build kppdf-web` last, visual note in report

## Acceptance

- [x] All P0/P1 from audit closed (T1 fixed, with the confirmedBy scope note above) or explicitly DEFERRED with reason (none deferred; P2 also fixed).
- [x] No underline-as-primary-action left for row tools (chip reset → `.pi-outline-btn`).
- [x] Expand/detail pattern matches registries where applicable (same hand-rolled pattern as `/orders`/`/shipping`).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, new read-only expand view + copy-only chip fix, no new route/permission)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route enhanced in place
- [x] page.md / PAGE-TZ-INDEX: **ADDED** — `docs/pages/supply.page.md` UI section note + test count updated
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`supply.page.ts`, `docs/pages/supply.page.md`, audit closeout, WAVE row 06, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (read-only expand of existing fields, no shared status/FK field semantics changed)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 685 passed (683 baseline + 2 new) / 7 pre-existing skipped / 692 total, 0 regressions
                                                     incl. supply.page.spec.ts 11/11 (9 existing + 2 new expand-behavior tests)
```

## Executor report

- **P1 fixed (T1), with a deliberate scope adjustment:** `supply.page.ts` rows now expand-in-row
  (click/Enter/Space, `tabindex="0"`, `aria-expanded`) showing full Линия заказа / Дата
  подтверждения / Примечание read-only. **`confirmedBy` intentionally NOT rendered** — verified
  against `backend/src/modules/supply/supply-task.schema.ts:42`, it's a raw `Types.ObjectId` with
  no username lookup anywhere in this page or its data-access layer. Showing it would introduce
  the exact "raw ObjectId in UI" anti-pattern (canon D1) this wave has been removing elsewhere —
  `confirmedAt` (a real formatted date) covers the practically useful signal ("when was this
  confirmed") without that regression. This is flagged explicitly in the audit closeout as a
  scope note, not a silent omission.
- **P2 fixed (A1):** filter-chip «Сбросить» converted from `underline underline-offset-2` text to
  `.pi-outline-btn` — same treatment as `/shipping`'s fix (now its 2nd real usage in the repo).
- **Specs added:** `supply.page.spec.ts` — expand shows line/confirmedAt/notes and collapses on
  second click; row-action click does not toggle expand. The second test needed
  `await fixture.whenStable()` before its post-click assertion — `load()` re-fetches via
  `firstValueFrom(...).then()`, which resolves on a microtask tick even with a synchronous mock
  observable, so an immediate `detectChanges()` briefly observes `status()==='loading'` (table
  not rendered at all) and the row query returns null.
- No BE fields invented, no second write-path, no other route touched, no money-ledger logic
  touched (all shown fields were already fetched by `list()`, just not rendered).
- `docs/pages/supply.page.md` — NX UX note added under `TZ-NX-SUPPLY-S1-PAGE` § UI, test count 9→11.
- Visual note: not run against a live dev server this session (no `pnpm serve` instance up);
  verified via `nx build` (full AOT template compile) + full kppdf-web jest suite green, including
  the two new expand-specific tests exercising the exact new markup.
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` (fix),
  `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.spec.ts` (2 new tests),
  `docs/pages/supply.page.md` (NX UX note), `docs/audits/2026-09-09-nx-ux-supply-audit.md`
  (closeout appended), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 06 DONE),
  `docs/agent-checklists/_NOW.md` (Claude IDLE), `docs/agent-checklists/TZ-NX-UX-06-supply-FIX.md`
  (this file), `tasks/_active/TZ-NX-UX-06-supply-FIX.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate (нет отдельного review inbox для этой волны); gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T17:20:00Z
