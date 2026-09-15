# TZ-NX-REGISTRY-DETAIL-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRY-DETAIL-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:26:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ1 archived `23b2feea`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-REGISTRY-DETAIL-TO-FEATURES.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRY-DETAIL-TO-FEATURES.md` на месте

## Investigation — no move; hard-blocked by the registries-platform contract

Traced every import of `registry-detail-panel.component.ts` +
`registry-detail-panel.facade.ts` (both TZ1 output) before moving anything.

Direct/transitive dependencies beyond `@angular/*` and `@kppdf/ui/*`:
- `./registry-toolbar-pagination.component` — used only by the panel (self-contained, movable alone)
- `./registry-row-action-button.component` — used only by the panel (self-contained, movable alone)
- `./registry-create-button.component` — used by the panel; already has independent
  feature-scoped siblings in `libs/features/src/lib/registry-forms/ui/` and
  `libs/features/src/lib/warehouse/ui/` (established duplication precedent for
  this exact 45-LOC pure-presentational button)
- `./model/registry-query-state.ts` (68 LOC) — used only by the facade + the toolbar-pagination component
- **`./model/registry.types.ts` (235 LOC)** — used by the panel, the facade,
  the toolbar-pagination component, the row-action-button component, the
  query-state helper, **and ~40 other files**: every `data/*.registry.ts` /
  `data/*-http-data-source.ts` / `data/*-registry-actions.ts` /
  `data/*-dialog-host.ts` file under `apps/kppdf-web/src/app/pages/registries/data/`,
  plus `registries.catalog.ts` and `registries-page.ts` itself.

`registry.types.ts` is the canonical, actively-evolving contract for the
**entire** `/registries` platform — its own header comment documents
`defineRegistry()` as "the single erasure boundary" every one of those ~40
registry definitions is authored against. It's not a small pure
type/utility file in the sense this program duplicates (`on-dialog-close-once.ts`,
2–4-field interfaces); it's 235 LOC / ~19 interconnected exports
(`RegistryDefinition<TRow>` alone embeds `RegistryColumn`, `RegistryFilter`,
`RegistryExpandable`, `RegistryRowAction`, `RegistryDataSource`) that the
whole registries `data/` layer treats as the single source of truth.
Duplicating it would immediately fork that invariant; moving it for real
would drag all ~40 `data/*.ts` files into this TZ's scope — far beyond an
"S"-sized "move facade+panel" task, and outside its conflict keys.

This is the same blocker class as `TZ-NX-REGISTRY-FORMS-TO-FEATURES` (B4
tail, `CategoryFormDialogComponent`/`CompositionPanelComponent`) and
`TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES` (B6, 2/4 blocked): a real,
non-duplicable shared foundation sitting directly in the move path, with no
self-contained subset left once it's excluded.

**Decision: no relocation.** `registry-detail-panel.component.ts` +
`registry-detail-panel.facade.ts` (+ their toolbar-pagination/row-action-button/
create-button siblings and `registry-query-state.ts`) stay in
`apps/kppdf-web/src/app/pages/registries/` exactly as TZ1 left them. No
`libs/features/src/lib/registries-shell/` directory or
`@kppdf/features/registries-shell` tsconfig path was created — moving only
the toolbar/action-button/create-button trio while the panel+facade (the
actual TZ subject) stay behind would be pure indirection with no benefit,
rejected as churn per this program's "no premature abstraction" rule.

## Acceptance

- [x] Specs green — no files touched, no-op verification: full kppdf-web suite (84/84 suites, 573/580 passed, 7 skipped)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — nothing moved, nothing to regress)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (investigation-only, no code change)
- [x] FIC §A–E — N/A (no code/behavior/route change at all)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (no module boundary moved — investigated and rejected)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (no product files touched; only this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ1 closure (`0b2d0e81`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB) — no-op, no files touched

## Gates (факт)

- No product/lib files changed — gates re-verified as a closing sanity check:
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: расследование без переноса кода. `registry-detail-panel.component.ts`/
`.facade.ts` (продукт TZ1) и их сателлиты (`toolbar-pagination`,
`row-action-button`, `create-button`, `registry-query-state.ts`) все
транзитивно зависят от `model/registry.types.ts` — 235-строчного
канонического контракта всей платформы `/registries`, на который завязаны
~40 файлов `data/*.registry.ts`/`*-http-data-source.ts`/`*-registry-actions.ts`/
`*-dialog-host.ts` плюс `registries.catalog.ts`/`registries-page.ts`. Это не
"маленький чистый" тип для дублирования (правило программы), а реальный
общий фундамент — перенос сдвинул бы объём задачи с "S: facade+panel" на
десятки файлов вне conflict keys. Решение: ничего не переносить,
задокументировать здесь.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал. Продуктовый код не менял.

Known limits: если `registry.types.ts` когда-нибудь получит свой
domain-lib дом (отдельная, гораздо более крупная волна, затрагивающая всю
`data/` папку), этот вывод стоит пересмотреть — он специфичен для текущего
расположения файла в `apps/`.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
