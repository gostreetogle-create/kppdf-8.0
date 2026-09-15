# TZ-NX-HOME-WORKFLOW-CHIPS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HOME-WORKFLOW-CHIPS.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T16:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] `_NOW.md` and `tasks/_active/` checked; workflow conflict keys available
- [x] TZ, home page, live route inventory, and workflow canon read
- [x] Dependencies completed in `33e06c08` and `f5fb1f3a`
- [x] Claim slot filled before product code

### Preflight Check Output
- **Context read:** `docs/pages/home.page.md`, `tasks/_ready/2026-09-15-nx-home/TZ-NX-HOME-WORKFLOW-CHIPS.md`, `docs/PO-CANON.md`, `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.ts`
- **Key Constraints:** chips are navigation only; only live NX routes; query `orderId` only when a row is expanded; no dead Combine chip and no `/desk` port; Paper & Ink TOC/active-ink style.
- **Planned Deliverable:** add Home · КП · Гант · Снабжение · Отгрузка strip; omit unavailable Комбайн; bind orderId query only to production/supply/shipping when expanded; add specs/docs.
- **Validation Path:** focused Home spec + tsc/lint/build; Integrity slot.

## Acceptance

- [x] Strip contains only live routes plus current Home.
- [x] Production/supply/shipping chips carry `orderId` only while a row is expanded.
- [x] Chip style is active ink/TOC, not ghost dashboard controls.
- [x] No `/desk`, dead Combine, Catalog/Admin/Registries chips.

## Integrity slot

- [x] Type: existing page behavior / navigation chips
- [x] FIC N/A (existing route/page; no new capability)
- [x] `docs/pages/home.page.md` updated
- [x] DOMAIN-MAP N/A
- [x] SECTION-READINESS N/A
- [x] No чужой WIP staged; conflict keys respected
- [x] COUPLING-MAP N/A (query reuses order id)

## Gates

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/home/home.page.spec.ts` — PASS (7/7)
- `pnpm exec nx lint kppdf-web` — FAIL baseline (repository-wide existing boundary/accessibility errors)
- `pnpm exec nx build kppdf-web` — PASS (exit 0, last gate; existing warnings only)

## Executor report

- Added live-route workflow strip: Главная, КП `/studio`, Гант `/production`, Снабжение `/supply`, Отгрузка `/shipping`.
- `orderId` query is emitted only for production/supply/shipping when a row is expanded; collapsed state has no order id.
- Combine omitted as dead NX route; desk/catalog/admin/registries omitted by scope.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:15:00+03:00
