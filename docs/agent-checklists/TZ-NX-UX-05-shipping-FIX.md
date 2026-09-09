# TZ-NX-UX-05-shipping-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-05-shipping-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T16:33:13Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-shipping-audit.md`, `orders-list.page.ts` expand-in-row pattern (precedent), `shipment.types.ts`, `shipment-doc-dialog.component.ts` (DOC_TYPE_LABELS)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-05-shipping-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/shipping/shipping.page.ts`, `shipping.page.spec.ts`, `shipment-doc-dialog.component.ts`, `docs/audits/2026-09-09-nx-ux-shipping-audit.md`, `docs/pages/shipping.page.md`
- **Key Constraints:** only P1+P2 from audit; whole `pages/shipping/**` in scope but only `shipping.page.ts` needed changes; no BE/money-ledger changes; reuse orders' expand pattern
- **Planned Deliverable:** expand-in-row (recipient/address/driver/notes/items/docs read-only) + chip button → `.pi-outline-btn`
- **Validation Path:** new specs for expand behavior, `nx build kppdf-web` last, visual note in report

## Acceptance

- [x] All P0/P1 from audit closed (T1 fixed) or explicitly DEFERRED with reason (none deferred; P2 also fixed, free).
- [x] No underline-as-primary-action left for row tools (chip reset → `.pi-outline-btn`).
- [x] Expand/detail pattern matches registries where applicable (same hand-rolled pattern as `orders-list.page.ts`, itself modeled on registries' expand-in-row intent).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, new read-only expand view + copy-only chip fix, no new route/permission)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route enhanced in place
- [x] page.md / PAGE-TZ-INDEX: **ADDED** — `docs/pages/shipping.page.md` TZ reference row
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`pages/shipping/**`, `docs/pages/shipping.page.md`, audit closeout, WAVE row 05, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (read-only expand of existing fields, no shared status/FK field semantics changed)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 683 passed (681 baseline + 2 new) / 7 pre-existing skipped / 690 total, 0 regressions
                                                     incl. all 4 shipping/** specs + 2 new expand-behavior tests
```

## Executor report

- **P1 fixed (T1):** `shipping.page.ts` rows now expand-in-row (click/Enter/Space, `tabindex="0"`,
  `aria-expanded`, same pattern as `orders-list.page.ts`) showing Получатель/Адрес/Водитель/
  Примечание/Позиции/Документы read-only (`:120-222`) — no more forced detour through the
  write-intent «Изменить» dialog just to see what's in a shipment. Row-action buttons' container
  gets `(click)="$event.stopPropagation()"` so dispatch/cancel/deliver/edit/doc don't also toggle
  the row. `expandedId` resets on `load()` (matches orders precedent — filter/reload collapses).
- **P2 fixed (A1):** filter-chip «Сбросить» converted from `underline underline-offset-2` text to
  `.pi-outline-btn` — no size override added on top (would reintroduce a new one-off style);
  accepted the canonical component's own proportions, per #04's fix precedent.
- **Reuse, no duplication:** `DOC_TYPE_LABELS` exported from `shipment-doc-dialog.component.ts`
  and imported into `shipping.page.ts` for the expand block's document-type labels, instead of
  re-declaring the same RU mapping twice.
- **Specs added:** `shipping.page.spec.ts` — expand shows all 6 fields and collapses on second
  click (`aria-expanded` both directions); clicking a row action does not also toggle expand
  (stopPropagation verified). Both pass.
- No BE fields invented, no second write-path, no other route touched, no money-ledger logic
  touched (all fields shown were already fetched, just not rendered).
- `docs/pages/shipping.page.md` — TZ reference row added.
- Visual note: not run against a live dev server this session (no `pnpm serve` instance up);
  verified via `nx build` (full AOT template compile) + full kppdf-web jest suite green, including
  the two new expand-specific tests exercising the exact new markup.
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/shipping/shipping.page.ts` (fix),
  `frontend-nx/apps/kppdf-web/src/app/pages/shipping/shipping.page.spec.ts` (2 new tests),
  `frontend-nx/apps/kppdf-web/src/app/pages/shipping/shipment-doc-dialog.component.ts`
  (`DOC_TYPE_LABELS` exported), `docs/pages/shipping.page.md` (NX UX note), `docs/audits/2026-09-09-nx-ux-shipping-audit.md`
  (closeout appended), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 05 DONE),
  `docs/agent-checklists/_NOW.md` (Claude IDLE), `docs/agent-checklists/TZ-NX-UX-05-shipping-FIX.md`
  (this file), `tasks/_active/TZ-NX-UX-05-shipping-FIX.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate (нет отдельного review inbox для этой волны); gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T17:00:00Z
