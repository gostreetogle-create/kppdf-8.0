# TZ-NX-UX-01-kit-forms-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-01-kit-forms-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T07:25:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-kit-forms-audit.md`, gold confirm-dialog wiring (`registry-detail-panel.component.ts`, `counterparties-list.page.ts`), shared helper `on-dialog-close-once.ts`, `PiDialogService`/`AlertDialogComponent` source, `docs/DIALOG-COOKBOOK.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-01-kit-forms-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/forms/forms.page.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/counterparties/counterparties-list.page.ts` (reference confirm-delete pattern), `frontend-nx/apps/kppdf-web/src/app/pages/on-dialog-close-once.ts`, `frontend-nx/libs/ui/paper-and-ink/src/lib/dialog/pi-alert-dialog.component.ts`, `frontend-nx/libs/ui/paper-and-ink/src/lib/dialog/pi-dialog.service.ts`
- **Key Constraints:** only P0/P1 (+P2 if free) from audit; one route `/kit/forms`; reuse existing Pi-*/dialog primitives, no new BE fields
- **Planned Deliverable:** confirm-dialog on destructive delete (parity with `/registries`/`/counterparties` gold) + live footer-CTA buttons
- **Validation Path:** `nx build kppdf-web` last, `nx test kppdf-web` + `nx test paper-and-ink` focused, visual note in report

## Acceptance

- [x] All P0/P1 from audit closed (P1 A2 fixed) or explicitly DEFERRED with reason (none deferred; P2 also fixed, free).
- [x] No underline-as-primary-action left for row tools (was already `pi-row-actions`/`pi-button`; unchanged).
- [x] Expand/detail pattern matches registries where applicable (Section IV, unchanged — already compliant per audit).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI kit demo, no new route/permission)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route fixed in place
- [x] page.md / PAGE-TZ-INDEX: N/A — no dedicated `/kit/forms` page.md exists (TZ's `PAGE_DOCS: texts.page.md / forms` points at an unrelated page — `docs/pages/texts.page.md` is `/doc-constructor/texts`, not `/kit/forms`; flagged in audit closeout, not a page.md to update)
- [x] DOMAIN-MAP: N/A (no route/module contour change, existing route fixed in place)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`frontend-nx/apps/kppdf-web/src/app/pages/forms/forms.page.ts`, audit closeout, WAVE row 01, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (no shared status/FK field touched — demo page, in-memory data only)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS (forms-page chunk 30.60kB → 32.04kB, +1.44kB ожидаемо от новых imports/methods)

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web        → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web         → PASS 103/103 suites, 681 passed / 7 pre-existing skipped / 688 total
cd frontend-nx && pnpm exec nx test paper-and-ink     → PASS 34/34 suites, 357/357 tests (dialog/toast primitives consumed by fix)
```

No dedicated `forms.page.spec.ts` exists — no template-binding unit test to run/add scoped to
this page; `nx build` (full AOT compile) is the structural gate per `docs/TZ-NX-BUILD-INTEGRITY.md`.

## Executor report

- **P1 fixed (A2):** `onInventoryDelete` (`forms.page.ts:524-539`) now opens `AlertDialogComponent`
  (`variant: 'destructive'`) via `PiDialogService` + shared `onDialogCloseOnce` helper (same helper
  `/counterparties` uses) before the demo "delete" toast fires. Matches `/registries` gold pattern.
- **P2 fixed (C1):** Section VIII footer buttons (`forms.page.ts:391,394`) — `Отмена`/`Отправить 142 строки`
  — wired to `onFooterCancel()`/`onFooterSubmit()` with toast feedback, consistent with every other
  interactive demo section on the page.
- Imports added: `DestroyRef`, `Injector` (`@angular/core`); `AlertDialogComponent`, `PiDialogService`
  (`@kppdf/ui/dialog`); `onDialogCloseOnce` (`../on-dialog-close-once`, existing shared helper, not new).
- No BE fields invented, no second write-path, no other route touched.
- Visual note: not run against a live dev server this session (no `pnpm serve` instance up); verified
  via `nx build` (full AOT template compile, catches binding errors) + full kppdf-web/paper-and-ink
  jest suites green. Recommend a quick manual click-through of `/kit/forms` delete + footer buttons
  next time the dev server is up, per `docs/agents/CLAUDE-UNATTENDED.md` best-effort visual note.
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/forms/forms.page.ts` (fix), `docs/audits/2026-09-09-nx-ux-kit-forms-audit.md`
  (closeout appended), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 01 DONE), `docs/agent-checklists/_NOW.md`
  (Claude IDLE), `docs/agent-checklists/TZ-NX-UX-01-kit-forms-FIX.md` (this file), `tasks/_active/TZ-NX-UX-01-kit-forms-FIX.md`
  (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate (нет отдельного review inbox для этой волны); gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T07:45:00Z
