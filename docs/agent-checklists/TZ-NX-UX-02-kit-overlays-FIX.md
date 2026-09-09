# TZ-NX-UX-02-kit-overlays-FIX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-02-kit-overlays-FIX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T13:53:56Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст после archive AUDIT)
- [x] TZ / канон / deps прочитаны: audit `2026-09-09-nx-ux-kit-overlays-audit.md`, kit-forms RU-copy precedent
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-02-kit-overlays-FIX.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/overlays/overlays.page.ts`, `docs/audits/2026-09-09-nx-ux-kit-overlays-audit.md`, `frontend-nx/apps/kppdf-web/src/app/pages/forms/forms.page.ts` (RU-copy precedent, Section VII "(Architectural)" heading precedent)
- **Key Constraints:** only P1 (EN button labels) from audit; one route `/kit/overlays`; pure copy fix, no logic/behavior change, no new BE fields
- **Planned Deliverable:** all interactive button labels translated to RU, technical component names kept in parens/`<code>` per existing page convention
- **Validation Path:** `nx build kppdf-web` last, `nx test kppdf-web` focused, visual note in report

## Acceptance

- [x] All P0/P1 from audit closed (P1 C1 fixed) or explicitly DEFERRED with reason (none deferred).
- [x] No underline-as-primary-action left for row tools (page has no row tools; N/A, already `pi-button`).
- [x] Expand/detail pattern matches registries where applicable (N/A — no table/expand on this page).
- [x] `nx build kppdf-web` PASS last; focused tests PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI kit demo, copy-only fix, no new route/permission)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route fixed in place
- [x] page.md / PAGE-TZ-INDEX: N/A — no dedicated `/kit/overlays` page.md exists; TZ's `PAGE_DOCS: ui-dialog-canon.md` is the production dialog canon (kinds A-D, overlay platform contract), not a page-specific doc for this kit demo route — matches #00/#01 precedent (no page.md for kit cookbook pages)
- [x] DOMAIN-MAP: N/A (no route/module contour change, existing route fixed in place)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`frontend-nx/apps/kppdf-web/src/app/pages/overlays/overlays.page.ts`, audit closeout, WAVE row 02, `_NOW.md` — все заявлены в TZ)
- [x] Coupling map: N/A (no shared status/FK field touched — demo page, no data mutation)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (production config, cache hit on 5/5 deps)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — PASS (copy-only change, bundle size effectively unchanged)

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, pre-existing warnings unrelated: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 681 passed / 7 pre-existing skipped / 688 total, 0 regressions
```

No dedicated `overlays.page.spec.ts` exists — pure copy-level change (button label text +
one body paragraph), no template bindings/logic touched, so no new unit test needed;
`nx build` (full AOT compile) is the structural gate.

## Executor report

- **P1 fixed (C1):** all ~10 English button labels in Sections I/II/III/V translated to RU
  (`overlays.page.ts:93-99,111-113,128-134,167-174`) — «Обычный диалог», «Диалог-форма»,
  «Диалог-подтверждение (destructive)», «Sheet справа/слева», «Drawer снизу», «Наведите курсор
  (native title tooltip)», «Открыть Popover», «Обычный»/«Успех»/«Ошибка»/«Внимание». Technical
  component names (`Sheet`, `Drawer`, `Popover`, `AlertDialog`) kept inline per existing page
  convention (matches how `<code>PiDialogService.open()</code>` etc. are already presented).
- **Extra smell found during FIX, not in original audit — fixed:** Section VI (Empty State) body
  copy was a full English paragraph (`overlays.page.ts:183-186`) describing `PiEmptyState` —
  translated to RU. Logged in audit closeout per TZ rule "if you find an extra smell on this same
  page while fixing — fix it and note in closeout" (PO-authorized).
- **Deliberately not touched (precedent from `/kit/forms`):** section `title` attributes (`"Dialog"`,
  `"Toast"`, `"Empty State"`, etc.) and the `<h4>Empty State (Architectural)</h4>` heading — same
  English pattern-name/architectural-demo convention already established and left as-is on
  `/kit/forms` (`"Form Field (Architectural)"`), for consistency across the kit cookbook pages.
- No BE fields invented, no second write-path, no other route touched, no template-binding/logic
  changes (pure label-text swap).
- Visual note: not run against a live dev server this session (no `pnpm serve` instance up);
  verified via `nx build` (full AOT template compile) + full kppdf-web jest suite green.
- Files: `frontend-nx/apps/kppdf-web/src/app/pages/overlays/overlays.page.ts` (fix), `docs/audits/2026-09-09-nx-ux-kit-overlays-audit.md`
  (closeout appended), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 02 DONE), `docs/agent-checklists/_NOW.md`
  (Claude IDLE), `docs/agent-checklists/TZ-NX-UX-02-kit-overlays-FIX.md` (this file), `tasks/_active/TZ-NX-UX-02-kit-overlays-FIX.md`
  (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate (нет отдельного review inbox для этой волны); gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T14:15:00Z
