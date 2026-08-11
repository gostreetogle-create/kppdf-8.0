# TZ-OPS-311 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-311.md` (удалён при closeout)
> Commit/push: **NO** unless PO says so

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: buffy-freebuff (Team Room: agent-1b7b339696)
- claimed_at: 2026-08-11T16:27:22Z
- workspace: D:\kppdf-8.0 (исполнитель в freebuff worktree ddc5da34, base синхронизирован с origin/main `ca035847`)
- team_room_claim: unavailable — CLI `claim TZ-OPS-311` → «Unknown task»: Team Room sync читает только `tasks/*.md` root-файлы, а маркер по протоколу лежит в `tasks/_active/`; конфликтных claim на ключи OPS-311 в комнате нет (status проверен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree ddc5da34 (HEAD == origin/main `ca035847`; canonical `D:\kppdf-8.0` = `main` same HEAD)
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (canonical `tasks/_active/` пуст; OPS-311 в map = READY executor, не claimed)
- [x] TZ / канон / deps прочитаны (AI-AGENT-GUIDE, AGENT-TASK-MODES, GEMINI.md, TZ-OPS-311)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-311.md` на месте

## Acceptance

- [x] `quick-create-dialog.component.ts` не импортирует ничего из `pages/`
- [x] Состав/BOM в quick-create по-прежнему работает (один write-path)
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] `pnpm architecture:check` PASS; baseline не вырос (7 → 3); ключ fe-shared-must-not-import-pages для quick-create удалён
- [x] Executor report ≤15 lines; archive `tasks/_archive/2026-08/TZ-OPS-311.done.md`

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (shared extract) — docs-only по части
- [x] FIC §A–E: N/A — нет новой страницы/права/модуля/MCP; только перемещение компонента (write-path состава не менялся)
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A (нет новой страницы)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (трогались только ключи OPS-311)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `pnpm architecture:check --write-baseline` → Wrote baseline (3 keys); `pnpm architecture:check` → PASS (914 files; baseline 3; resolved 0)
- Jest focused (quick-create-dialog / product-bom-panel / product-composition-picker / product-form-dialog) → 4/4 suites PASS (63 tests)
- Prettier --check 10 touched files → PASS; ESLint changed files → PASS (0 errors)
- Pre-existing (подтверждено stash-тестом на чистом HEAD): module-detail.page.spec 3 fail + products.page.spec 21 fail — известная нестабильность dictionary-labels/httpResource flush, НЕ регрессия этого TZ

## Executor report

- Что: BOM panel + composition picker перенесены `pages/products/` → `shared/ui/composition/` (Preference A); quick-create (shared) больше не импортирует `pages/*`; в панели импорты module/material form-диалогов стали динамическими (lazy-паттерн как у product-form); обновлены 4 импортёра + spec'ы.
- Conflict disclosure: только conflict keys TZ-OPS-311; чужой WIP не тронут; deploy НЕ; commit/push НЕ.
- Known limits: диалоги редактирования в панели открываются на микротаск позже (динамический импорт), поведение не меняется; proposal-product-rail:22-24 page→page keys остаются в baseline — successor TZ (known_limitation из TZ).
- Primary signal: BOM в quick-create после L-create рендерится (jest) — met. Secondary: tsc / architecture / prettier / eslint — PASS.

## Review handoff

- [x] READY FOR REVIEW — OPS-311 review: Cursor/PO, если Layer-3 shared «тронут широко»; здесь поведение не менялось, gates зелёные, archive создан по AC.

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-11T16:37:13Z
