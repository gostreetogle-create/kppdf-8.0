# TZ-NX-LUCIDE-ICONS-REGISTER checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-LUCIDE-ICONS-REGISTER.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T04:27:29Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-LUCIDE-ICONS-REGISTER.md` на месте

## Acceptance

- [x] `importProvidersFrom(LucideAngularModule.pick({ Check, Minus, ArrowUpRight }))` в NX `app.config.ts`
- [x] Регресс-тест: `checkbox.component.spec.ts` — реальный `LucideAngularModule.pick`, `checked=true`/`indeterminate=true` не бросают; negative-control доказывает, что без pick тест ловит ту же ошибку `"... icon has not been provided by any available icon providers."`
- [x] Grep: `LucideAngularModule.pick` присутствует в NX `app.config.ts`
- [x] Gates PASS (tsc, test, architecture:check, nx build kppdf-web); lint — см. Gates ниже (pre-existing baseline debt, не в затронутой области)

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (DI providers) — global, не отдельная page
- [x] FIC: N/A с причиной — global provider wiring, не новая page/permission/module/MCP
- [x] page.md / PAGE-TZ-INDEX: N/A (global, TZ говорит page.md не обязателен)
- [x] DOMAIN-MAP: N/A — не менял module/route/page контур
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только app.config.ts + checklist/_NOW)
- [x] Coupling map: N/A — не трогал общее поле/статус
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (PASS, до правки)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — проверено, `_active` был пуст
- [x] Закрытие: `nx build kppdf-web` → exit 0 (PASS, последняя команда)

## Gates (факт)

- `cd frontend-nx && pnpm exec nx build kppdf-web` (baseline, до кода) → **PASS** exit 0
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` (nx test, 5 projects) → **PASS** 105 suites / 726 passed / 7 skipped
- `cd frontend-nx && pnpm lint` → **FAIL** 38 errors, но **все** в файлах вне scope этого TZ (`studio-properties-panel`, `studio-table-properties`, `studio-text-properties`, `studio-workspace-shell.component.html`, `supply-requests.page.ts`, `supply.page.ts`, `warehouse/storage-items.page.ts`, `warehouse/warehouses.page.ts` — a11y click/keyboard + `eqeqeq`). Верифицировано `git stash` моих правок (`app.config.ts` + spec) → тот же результат `271 problems (38 errors)` без них. Pre-existing baseline debt, не введено этим TZ; мои файлы (`app.config.ts`, `checkbox.component.spec.ts`) — 0 lint issues.
- `pnpm architecture:check` → **PASS** (1473 files; baseline 17; resolved since baseline: 2)
- `cd frontend-nx && pnpm exec nx build kppdf-web` (закрытие, последняя команда) → **PASS** exit 0

## Executor report

- Добавлен `importProvidersFrom(LucideAngularModule.pick({ Check, Minus, ArrowUpRight }))` в `frontend-nx/apps/kppdf-web/src/app/app.config.ts` (единственная product-правка).
- Новый файл `frontend-nx/libs/ui/paper-and-ink/src/lib/checkbox/checkbox.component.spec.ts` — 3 теста, включая negative-control, который реально ловит `"has not been provided by any available icon providers"` без pick.
- Lint: pre-existing debt вне scope, задокументировано и НЕ фиксилось (нет мандата TZ на a11y-рефактор в 8 несвязанных файлах).
- Conflict keys соблюдены: только `app.config.ts` + новый spec-файл + checklist/_active/_NOW/archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T04:47:00Z
