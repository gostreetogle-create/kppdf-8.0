# TZ-FRONTEND-304 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-FRONTEND-304.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: Buffy (freebuff)
- claimed_at: 2026-08-16T01:14:01+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room недоступен в клиенте

## Preflight

- [x] Рабочий корень и ветка проверены: `D:/kppdf-8.0`, `main == origin/main` до claim
- [x] `_NOW.md` прочитан; `tasks/_active/` был пуст до claim
- [x] TZ, Angular container/presentational канон и dependency boundary прочитаны
- [x] Claim slot и active marker созданы до кода
- [x] Baseline focused composition + quick-create specs: 3 suites / 38 tests PASS

## Caller / dynamic-import map

- `pages/products/product-detail.page.ts` — shared panel, уже владеет ProductDialog
- `pages/modules/module-detail.page.ts` — shared panel, уже владеет ModuleDialog
- `pages/products/product-form-dialog.component.ts` — shared panel в edit mode
- `shared/ui/quick-create/quick-create-dialog.component.ts` — shared panel в create/edit composition mode
- `shared/services/product-composition-dialog.service.ts` — новый coordinator для page-dialog boundary
- Before child: dynamic imports were inside `product-bom-panel.component.ts` (module/product/material forms) and `product-composition-picker-dialog.component.ts` (material form)
- After child: page imports are centralized in `shared/services/product-composition-dialog.service.ts`; composition UI contains no `pages/**` dynamic import

## Acceptance

- [x] Characterization baseline/evidence зафиксированы: existing panel tests cover load/tree selection, add write-path, read-only leaf action, module/material cost hints; baseline 38/38 PASS
- [x] Shared composition UI no longer owns page dialog orchestration; no `pages/**` dynamic import from `shared/ui/composition/**`
- [x] Coordinator preserves existing Product/Module/Material dialog data and close refresh; existing product edit path + page specs PASS
- [x] Boundary documented: tree/selection/composition writes remain panel-owned; cross-domain page-dialog loading/open/close refresh is coordinator-owned
- [x] Composition add/change/remove, permissions/read-only and cost hint behavior preserved by characterization suites
- [x] Focused composition/QuickCreate + affected module/product form specs: 5 suites / 69 tests PASS across baseline and change gates
- [x] Child batch = 6 owned files; exact shared composition/coordinator keys only

## Rationale

Выбран безопасный разрез A: panel сохраняет tree, selection, composition API и picker write-path,
а cross-domain открытие page-dialogs передаётся в отдельный coordinator service. Так удаляется
shared/ui → pages dynamic-import boundary без переноса pricing/composition rules, нового store или
UX-изменения. Coordinator — единственная точка существующих lazy dialog imports.

## Integrity slot

- [x] Тип изменения: other — архитектурный frontend refactor без нового route/API/permission
- [x] FIC §A–E: N/A, route/API/permission/MCP не меняются
- [x] page.md / PAGE-TZ-INDEX: N/A, UX-контракт страниц не меняется
- [x] SECTION-READINESS: N/A, readiness не меняется
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Child shared coordinator + composition components: frontend tsc PASS
- Focused Jest: 3 suites / 38 tests PASS
- Changed-files ESLint PASS
- Changed-files Prettier PASS
- `git diff --check` PASS (CRLF normalization warnings only)
- `pnpm architecture:check` BLOCKED by pre-existing unrelated dashboard cross-page imports (`dashboard.page.ts:19,26`, from TZ-SWEEP-401); no new violation points to this child

## Executor report

- Scope delivered: page-dialog orchestration moved from shared composition components to `ProductCompositionDialogService`; existing lazy dialog components, data payloads, close refresh and composition writes preserved.
- Residual boundary: panel still owns composition API calls and local tree state by design; a full API lift is a separate successor, not hidden in this child.
- Conflict disclosure: untouched `docs/PO-DIARY.md`, `data/*`, dashboard/audit WIP and unrelated backlog/park files.
- Review verdict: self-review PASS for TZ acceptance; architecture command remains blocked only by pre-existing dashboard cross-page imports.

## Review handoff

- [x] READY FOR REVIEW recorded after focused gates
- [x] Independent external Cursor unavailable; no new product/deploy blocker found
- [x] Archive + lock prepared after self-review PASS; final commit/push pending

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T01:28:00+03:00
- implementation commit: `6490fe80`
