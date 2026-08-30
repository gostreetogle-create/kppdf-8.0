# TZ-NX-A2-ui-audit checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-A2-ui-audit.done.md`

## Claim slot
- agent_id: cursor-orchestrator
- claimed_at: 2026-08-29T13:08:30+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: N/A

## Acceptance
- [x] All public components and secondary entries inventoried.
- [x] Standalone and OnPush verified (63/64 standalone; 64/64 OnPush).
- [x] inject() and service dependencies reviewed.
- [x] No core/services/data-access/http imports in production code.
- [x] ThemeService export and behavior verified.
- [x] Raw colors / global CSS reviewed.
- [x] Exports for button/card/dialog/table/theme/toast verified.
- [x] Absence of `@kppdf/util-http` confirmed.
- [x] Public API vs tsconfig paths alignment checked.
- [x] Component table with status/blocker/recommendation produced.
- [x] No product code changed.

## Integrity slot
- [x] Тип изменения: analysis-only (docs/archive).
- [x] FIC §A–E: N/A — no product behavior.
- [x] page.md / PAGE-TZ-INDEX: N/A.
- [x] SECTION-READINESS: N/A.
- [x] Чужой WIP не в коммите; conflict keys: read-only audit.
- [x] Coupling map: N/A.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Gates
- Static grep/read audit only; no code gates required for analysis-only scope.

## Auditor report
Paper & Ink passes UI lib hygiene: zero util-http/data-access, ThemeService canonical, key secondary entries aligned. PiThemeEditor is the only non-standalone component. Several primitives (drawer/sheet/tabs) lack public path aliases — document or add entries in follow-up TZ. **Outcome: PASS.**

## Closeout
- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T13:13:00+03:00
