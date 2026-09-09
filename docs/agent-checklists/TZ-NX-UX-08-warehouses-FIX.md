# TZ-NX-UX-08-warehouses-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-08-warehouses-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T17:37:02Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-warehouses-audit.md` (cross-cutting finding), `ButtonComponent` variant/size API, empirical `data-test`-on-`app-pi-button` click precedent
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-08-warehouses-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts`, `warehouse-form-dialog.component.ts`, `warehouses.page.spec.ts`, `warehouse-form-dialog.component.spec.ts`, `docs/audits/2026-09-09-nx-ux-warehouses-audit.md`
- **Key Constraints:** only P0 from audit; scope = `warehouses.page.ts` + `warehouse-form-dialog.component.ts` only (same write-flow, PO-authorized same-page-fix rule) — explicitly NOT the other 17 affected files
- **Planned Deliverable:** every `<button class="pi-button pi-button-*">` → real `<app-pi-button variant="...">`
- **Validation Path:** existing tests must pass unmodified (pure class/component swap, no behavior change); `nx build kppdf-web` last

## Acceptance

- [x] All P0/P1 from audit closed (P0 fixed for this page) or explicitly DEFERRED with reason (the other 17 files are explicitly out-of-scope, not "deferred" — flagged separately for PO decision, not this TZ's responsibility).
- [x] No underline-as-primary-action left for row tools (N/A here — this finding was about undefined classes, not underline; already resolved).
- [x] Expand/detail pattern matches registries where applicable (N/A — T1 was genuinely N/A per audit, no hidden data on this page).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, component swap, no new route/permission, no behavior change)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route fixed in place
- [x] page.md / PAGE-TZ-INDEX: **ADDED** — `docs/pages/warehouses.page.md` TZ reference row, cross-references the cross-cutting finding
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`warehouses.page.ts`, `warehouse-form-dialog.component.ts`, `docs/pages/warehouses.page.md`, audit closeout, WAVE row 08, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (pure visual component swap, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 687 passed (identical to pre-fix baseline — no new tests needed, no behavior changed), 0 regressions
                                                     incl. warehouses.page.spec.ts 3/3 and warehouse-form-dialog.component.spec.ts 2/2, both unmodified
```

## Executor report

- **P0 fixed for `/warehouses` only:** all 6 buttons in `warehouses.page.ts` (Создать склад,
  Сделать по умолчанию, Изменить, Удалить) and `warehouse-form-dialog.component.ts` (Отмена,
  Сохранить) converted from the undefined `pi-button pi-button-*` class strings to the real
  `<app-pi-button variant="...">` component (`default`/`secondary`/`outline` per role). Pure
  component swap — no `(click)` handler signature changes, `[disabled]` binding preserved on
  Сохранить, all `data-test` attributes preserved verbatim.
- **Verified empirically, not assumed:** before converting, checked that an existing passing test
  elsewhere in the codebase (`supply-request-form-dialog.component.spec.ts`) already used the
  identical `data-test`-on-`<app-pi-button>` + `.click()` pattern successfully; after converting,
  ran both this page's spec files and confirmed all 5 existing tests pass unmodified — no
  selector or click behavior broke.
- No new specs needed (TZ criteria #4 is about specs "where behaviour changes" — nothing changed
  behaviorally here, only the rendered class/component, so this is satisfied vacuously).
- **Explicitly did NOT touch** the other 17 files sharing this exact bug — out of this TZ's scope
  (conflict keys name only `warehouses.page.ts`; "НЕ: другие routes"). Full list is in the audit's
  cross-cutting finding section. This includes 4 pages this wave already marked DONE
  (`orders-list.page.ts` #04, `shipping.page.ts` #05, `supply.page.ts` #06,
  `supply-requests.page.ts` #07) — their primary CTAs are **still unstyled**.
- **⚠️ Flagging for the PO explicitly, not burying this in a checklist line:** this is a
  cross-cutting library-usage defect, not a per-page smell. Recommend either (a) a dedicated
  cross-cutting TZ sweeping all 17 remaining files with the same mechanical fix proven here, or
  (b) accepting it gets fixed incrementally as each page's own UX wave comes due (slower, leaves
  known-broken pages live longer). Either way, **the remaining wave (#09 onward) will keep
  re-discovering this same finding on every page that uses it** unless addressed separately —
  worth deciding before continuing the sweep.
- `docs/pages/warehouses.page.md` — NX UX note added.
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` (fix),
  `warehouse-form-dialog.component.ts` (fix), `docs/pages/warehouses.page.md` (NX UX note),
  `docs/audits/2026-09-09-nx-ux-warehouses-audit.md` (closeout appended),
  `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 08 DONE + warning),
  `docs/agent-checklists/_NOW.md` (Claude IDLE + warning),
  `docs/agent-checklists/TZ-NX-UX-08-warehouses-FIX.md` (this file),
  `tasks/_active/TZ-NX-UX-08-warehouses-FIX.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate для этой волны; gates зелёные. **Cross-cutting находка требует решения PO** — см. Executor report, не архивировать/забывать без ответа PO.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T18:00:00Z
