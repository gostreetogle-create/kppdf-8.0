# TZ-NX-DOCSTUDIO-VITRINA-EDIT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-VITRINA-EDIT.md` (removed at archive)
> Wave: `docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md` (#4/4, last)
> Commit/push: по `docs/GIT-POLICY.md`

## Re-claimed after WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA #1-3 landed

Previous attempt (2026-09-12T19:52) was DEFERRED because `_NOW.md` said not
to start until the peer audit closed. That audit is closed — synthesis at
`docs/audits/2026-09-12-docstudio-catalog-tables-peer-synthesis.md` — and
this wave's own PROMPT explicitly queues this TZ as #4, after #1
(`refreshCatalogTablesOfKind` helper) and #2 (serial hydrate) landed. New
requirement added by the wave prompt beyond the original TZ text: after
Save, also call `refreshCatalogTablesOfKind(kind)` so the A4 sheet's table
updates without F5, not just the vitrina card.

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-12T20:24:06Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этой сессии)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (папка была пуста, кроме `.gitkeep`)
- [x] TZ / канон / deps прочитаны (`docs/pages/document-studio.page.md`, `studio-data-vitrina.component.ts`, `catalog-registry-dialog-host.ts`, `material-registry-dialog-host.ts`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-VITRINA-EDIT.md` на месте

## Acceptance (из TZ + wave prompt)

- [x] На 4 вкладках у каждой строки есть «Изменить» (между названием и Добавить/Убрать)
- [x] Клик открывает edit dialog (тот же, что `/registries`); можно сменить фото/поля и Save
- [x] После Save витрина обновлена без перехода в реестр (per-kind refetch)
- [x] После Save `refreshCatalogTablesOfKind` обновляет A4-таблицу этого kind (wave-prompt addition)
- [x] Specs + `nx build kppdf-web` green

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (studio panel behavior), no new route
- [x] FIC: N/A — не новая страница/право/модуль/MCP
- [x] page.md обновлён (§3.3 Данные, «Товары» TOC row)
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — page.md updated same TZ

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (stage 3 close already left it green)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `pnpm exec nx test kppdf-web` → 122 suites / 850 tests PASS (new: `studio-data-vitrina-edit.spec.ts` 6 tests + 1 added to `studio-editor-catalog-insert.spec.ts`)
- `pnpm exec nx lint kppdf-web` → new files add only pre-existing-style warnings (`no-non-null-assertion`, consistent with the rest of the test suite); 0 new errors — checked touched-file lines specifically
- `pnpm exec nx build kppdf-web` → exit 0, same pre-existing budget warnings as baseline

## Executor report

- `studio-data-vitrina.component.ts`: reuses `createCatalogRegistryDialogHost` (products/modules) + `createMaterialRegistryDialogHost` (parts/materials, configs mirroring `details.registry.ts`/`materials.registry.ts`) — no new form. Added `edit(id)`, per-kind `reload*()` methods (refactored out of `ngOnInit`), new output `catalogEntitySaved`.
- `studio-data-panel.component.ts`: pass-through `catalogEntitySaved` output.
- `studio-editor.page.ts`: `onCatalogEntitySaved(kind)` → `refreshCatalogTablesOfKind(kind)` (built in #1/#2 of this wave) — A4 table heals without F5.
- New specs: `studio-data-vitrina-edit.spec.ts` (button placement on all 4 tabs, per-kind dialog routing + config, Save→refresh→emit, cancel→no-op); +1 in `studio-editor-catalog-insert.spec.ts` for `onCatalogEntitySaved`.
- `docs/pages/document-studio.page.md` — one-liner in §3.3 «Товары» TOC row.
- Did not touch `/registries` list UX, A4 geometry, deploy, or navigate away from studio.

## Review handoff

- [ ] Review не требуется отдельным TZ-полем; PO смотрит на живом экране

## Closeout (после PASS)

- [ ] archive + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
