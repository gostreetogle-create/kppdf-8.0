# TZ-UX-FORM-306 — Module QuickCreate L BOM

**Status:** DONE
**Source:** `tasks/_backlog/TZ-UX-FORM-306-module-quickcreate-L-bom.md`

## Claim slot

- agent_id: `agent-acfffc1331`
- claimed_at: `2026-08-08T10:10:00Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- team_room_claim: unavailable — registry reports unknown task; checklist is source of truth

## Conflict keys

- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts`
- `frontend/src/app/pages/products/product-bom-panel.component.ts`
- `docs/audits/2026-08-08-data-entry-dedupe-audit.md`
- `docs/audits/2026-08-08-quickcreate-L-full-passport.md`
- `docs/agent-checklists/TZ-UX-FORM-306.md`

## Plan

- Generalize QuickCreate's post-create entity state to Product | ProductModule.
- Keep Product L behavior and bind ProductBomPanel rootKind explicitly for Product/Module.
- Make Module L stay open after create with optional BOM and Done footer.
- Add focused Jest coverage for module L stay/panel and preserve product L assertions.
- Run frontend tsc, targeted Jest, ESLint, Prettier/diff checks, review, then archive and push.

## Verification

- tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`
- Jest: PASS — QuickCreate + ProductBomPanel, 2 suites / 19 tests
- lint: PASS — scoped ESLint on QuickCreate source/spec
- diff-check: PASS
- review: PASS — no critical issues
- archive/lock/progress/map: DONE
