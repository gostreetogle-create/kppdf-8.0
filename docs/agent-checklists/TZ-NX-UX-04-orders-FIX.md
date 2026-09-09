# TZ-NX-UX-04-orders-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-04-orders-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T16:21:03Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-orders-audit.md`, `.pi-outline-btn` definition (`global.css:997-1048`), disabled-state precedent (`registry-toolbar-pagination.component.ts`, `.pi-icon-btn:disabled`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-04-orders-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts`, `docs/audits/2026-09-09-nx-ux-orders-audit.md`, `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css` (`.pi-outline-btn`/`.pi-outline-btn-destructive`), `docs/pages/orders.page.md`
- **Key Constraints:** only P1 from audit (systemic ad-hoc button styling + focus-ring); one route `/orders`; pure class/markup fix, no behavior/BE change
- **Planned Deliverable:** all 9 affected controls converted to `.pi-outline-btn` (`.pi-outline-btn-destructive` for the one destructive trigger), underline link fixed
- **Validation Path:** `nx build kppdf-web` last, `nx test kppdf-web` focused (incl. `orders-list.page.spec.ts` + `order-hub-tray.component.spec.ts`), visual note in report

## Acceptance

- [x] All P0/P1 from audit closed (P1 fixed) or explicitly DEFERRED with reason (none deferred).
- [x] No underline-as-primary-action left for row tools (`Шаблоны документов` converted to `.pi-outline-btn`).
- [x] Expand/detail pattern matches registries where applicable (unchanged — was already OK per audit).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, copy/class-only fix, no new route/permission)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route fixed in place
- [x] page.md / PAGE-TZ-INDEX: **ADDED** — `docs/pages/orders.page.md` TZ reference row + footer date updated
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`order-hub-tray.component.ts`, `docs/pages/orders.page.md`, audit closeout, WAVE row 04, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (no shared status/FK field touched — pure CSS class swap)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 681 passed / 7 pre-existing skipped / 688 total, 0 regressions
                                                     incl. orders-list.page.spec.ts PASS, order-hub-tray.component.spec.ts PASS
```

## Executor report

- **P1 fixed:** all 9 ad-hoc-styled controls in `order-hub-tray.component.ts` converted to
  `.pi-outline-btn` (`:125,143,153,184,204,239,269,305`) — the class existed (`global.css:997-1048`,
  TZ-AUDIT-7) but had **zero usages anywhere in the repo** before this fix. `Отменить отгрузку`
  (`:294`) also gets `.pi-outline-btn-destructive` to match its own confirm-dialog `variant:
  'destructive'` — small in-scope semantic upgrade, same mechanism. `Подтвердить материалы` keeps
  its `[disabled]` binding, now paired with `disabled:opacity-40 disabled:cursor-not-allowed`
  (matches existing disabled-button convention elsewhere in the app). The literal
  `<a class="underline">` (`Шаблоны документов`, `:326`) now uses the same `.pi-outline-btn`
  treatment as its sibling section links.
- `.pi-outline-btn`'s own `:focus-visible` box-shadow now covers all 9 controls — fixes the missing
  keyboard-focus indicator on the 8 that had none; dropped the redundant `pi-focus-ring` class on
  the 2 that already had one (same visual mechanism, no double-declaration).
- `orders-list.page.ts` — no changes, was already clean.
- Pure class/markup change: no `data-test` attrs touched, no template bindings/logic/behavior
  changed, no BE fields invented, no second write-path, no other route touched.
- `docs/pages/orders.page.md` — TZ reference row + footer `Обновлено` date added.
- Visual note: not run against a live dev server this session (no `pnpm serve` instance up);
  verified via `nx build` (full AOT template compile) + full kppdf-web jest suite green, including
  the two specs that directly cover these files.
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` (fix),
  `docs/pages/orders.page.md` (NX UX note), `docs/audits/2026-09-09-nx-ux-orders-audit.md`
  (closeout appended), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 04 DONE),
  `docs/agent-checklists/_NOW.md` (Claude IDLE), `docs/agent-checklists/TZ-NX-UX-04-orders-FIX.md`
  (this file), `tasks/_active/TZ-NX-UX-04-orders-FIX.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate (нет отдельного review inbox для этой волны); gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T16:45:00Z
