# TZ-NX-REGISTRIES-CATEGORY-GROUPS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-CATEGORY-GROUPS.md` (removed at archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-01T20:23:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — S25 отмечен PARALLEL, conflict keys `frontend-nx/**/registries/**` свободны
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRIES-CATEGORY-GROUPS.md` на месте

## Acceptance (из TZ)

- [x] Registry master rows grouped by `category` — добавлено опциональное поле `category` на `RegistryDefinition`/`RegistryMasterRow` (`model/registry.types.ts`), выставлено на всех 10 реестрах каталога (units/materials/details/modules/products → «Каталог», supply-requests → «Склад», organizations → «Контрагенты», product-passports/text-blocks/table-templates → «Документы»); без `category` — fallback «Реестры»
- [x] Visual: category label row + spacing above each group, mobile not broken — `registries-page.ts`: `@for` по `groupedRows()`, `<h2 class="eyebrow mb-2 px-1">` над каждым `app-pi-table`, `flex flex-col gap-8` между группами (тот же `eyebrow`-паттерн, что и в `kit-layout.component.ts` nav groups); `app-pi-table` уже `overflow-x-auto` — mobile не менялся
- [x] `studio/**` not touched — подтверждено `git status` (изменены только `pages/registries/**`)

## Integrity slot

- [x] Тип изменения: page (frontend-nx `/registries`)
- [x] FIC §A–E: N/A — internal component change, no new page/permission/module
- [x] page.md / PAGE-TZ-INDEX: N/A — no route/page-key change
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys `frontend-nx/**/registries/**` соблюдены, `studio/**` не тронут
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (cache, warnings pre-existing в studio/**)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` конфликтующим по `registries/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx build kppdf-web            → exit 0 (baseline, до кода)
pnpm exec nx test kppdf-web --testPathPattern="registries"
                                          → 54 suites, 294 passed, 7 skipped
pnpm exec nx lint kppdf-web              → 21 errors / 75 warnings, все в studio/** (pre-existing, не тронуто)
pnpm exec nx test kppdf-web --testPathPattern="registries-page.spec"
                                          → 54 suites, 295 passed (+1 новый тест группировки), 7 skipped
pnpm exec nx build kppdf-web            → exit 0 (закрытие, последняя команда)
```

## Executor report

- Что сделано: `/registries` master table теперь группируется по `category` (опциональное поле `RegistryDefinition.category`, resolved в `RegistryMasterRow.category`, fallback `REGISTRY_DEFAULT_CATEGORY = 'Реестры'`). Каждая группа — свой `<h2 class="eyebrow">` + свой `app-pi-table` (один `expandedRowWhen`/`expandedRowLabel` предикат общий на все группы, т.к. завязан на `registryKey` из route, а не на конкретный table instance — единственная открытая строка сохраняется).
- Изменённые файлы: `model/registry.types.ts`, `registries-page.ts` (+spec), `data/{units,materials,details,modules,products,supply-requests,organizations,product-passports,text-blocks,table-templates}.registry.ts`.
- Категории (MVP, hardcoded per registry): Каталог (units, materials, details, modules, products), Склад (supply-requests), Контрагенты (organizations), Документы (product-passports, text-blocks, table-templates).
- Conflict disclosure: `studio/**` не тронут (запрет TZ соблюдён). Рабочее дерево на момент старта содержало чужой uncommitted WIP (studio S8-S10, docs, tasks/* prompts) — не трогал, не staged.
- Known limits: группировка — hardcoded string literal per registry, не отдельный enum/константа; при добавлении новых реестров нужно вручную проставить `category` (или он упадёт в дефолтную группу «Реестры»).
- Новый unit-тест: `registries-page.spec.ts` — «groups master rows by category into a labelled section per group, in catalog order».

## Review handoff

- [x] READY FOR REVIEW — TZ не требует отдельного review-inbox

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-01
