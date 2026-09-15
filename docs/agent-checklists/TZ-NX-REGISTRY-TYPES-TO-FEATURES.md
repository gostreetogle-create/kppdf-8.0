# TZ-NX-REGISTRY-TYPES-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRY-TYPES-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:55:08Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `_active` empty at claim time; noted a concurrent claim (`TZ-NX-HOME-ROUTE-SHELL`, conflict keys `app.routes.ts`/`nav-categories.ts`/`pages/home/**`/`docs/pages/home.page.md`/`docs/pages/PAGE-TZ-INDEX.md`) referenced in `_NOW.md` but the marker itself was gone by claim time — no overlap with this TZ's conflict keys either way
- [x] TZ / канон / deps прочитаны (`TZ-NX-REGISTRY-TYPES-TO-FEATURES.md`, `WAVE-MAP.md` for B9)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRY-TYPES-TO-FEATURES.md` на месте

## Pre-existing recovery (disclosed, done before claiming B9's TZ1)

Found `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`/`.spec.ts`
and `docs/pages/document-studio.page.md` carrying a large uncommitted diff
matching `docs/agent-checklists/TZ-NX-DOCSTUDIO-LIST-BULK-DELETE.md`
(untracked, `claimed_at: 2026-09-14T18:20:00Z`, `Status: DONE`) almost
exactly — a prior session's fully-tested, QA'd work whose final commit never
landed. Re-verified gates fresh (tsc clean, targeted spec 12/12, `nx build`
exit 0, `architecture:check` clean) and committed it standalone
(`483ea98c`) before touching anything in B9 — it directly blocks this
wave's `TZ-NX-STUDIO-LIST-FACADE` (TZ5/6), which expects bulk-delete
already in place. Full disclosure in that commit's message.

## Investigation — retry after B8's TZ2 block

B8's `TZ-NX-REGISTRY-DETAIL-TO-FEATURES` investigated and rejected this
exact move (`registry.types.ts`, 235 LOC, ~40 consumers) as out of scope
for an "S" TZ. This TZ is explicitly "SIZE L" and explicitly authorizes
"fix all imports" — the dedicated, properly-scoped follow-up B8's checklist
flagged as a `Known limits` item.

Counted exact consumers via `grep -rl "model/registry\.types'"` /
`"model/registry-query-state'"`: 66 files (registry.types, product code +
specs) + 2 files (registry-query-state: `registry-detail-panel.facade.ts`,
`registry-toolbar-pagination.component.ts`) + its own
`registry-query-state.spec.ts`.

## What changed

New lib `libs/features/src/lib/registries-platform/` (`@kppdf/features/registries-platform`,
added to `tsconfig.base.json`) — a dedicated lib, not `registry-forms`
(that lib is specifically the create/edit dialog forms; the type contract
is a different, lower-layer concern used by every registry definition, not
just forms). Moved via `git mv` (history preserved):
- `registries/model/registry.types.ts` → `registries-platform/registry.types.ts`
- `registries/model/registry-query-state.ts` → `registries-platform/registry-query-state.ts`
  (pure functions built on the types — "only pure model helpers" per the TZ text)
- `registries/model/registry-query-state.spec.ts` → `registries-platform/registry-query-state.spec.ts`
  (self-contained, zero Angular DI — imports only `convertToParamMap` type-adjacent
  helper + the two moved sibling files)

`registry-query-state.ts`'s own internal `from './registry.types'` import
needed no change — both files now live in the same lib directory. Added
`registries-platform/index.ts` barrel exporting both.

Fixed all 66 + 2 import sites via a scripted bulk replace (relative
`../model/registry.types` / `./model/registry.types` / `*/model/registry-query-state`
→ `@kppdf/features/registries-platform`), then manually merged the one file
that ended up with two separate import statements from the same new module
after the mechanical replace (`registry-detail-panel.facade.ts` — imported
`registry.types` and `registry-query-state` separately) into one. Verified
zero remaining old-path references via `grep -rln "model/registry"`.

`apps/kppdf-web/src/app/pages/registries/model/` is now empty (both files +
spec moved out). No dual type copies — single source of truth in features,
apps import from features (the intended direction).

Unblocks `TZ-NX-REGISTRY-DETAIL-TO-FEATURES` (next in this wave).

## Acceptance

- [x] registries* specs green — all 29 registries-scoped suites in `kppdf-web` confirmed PASS individually (`registry-detail-panel.component.spec.ts`, `registries-page.spec.ts`, `registries-a11y.spec.ts`, `registries.routes.spec.ts`, every `data/*.spec.ts`, `registry-toolbar-pagination.component.spec.ts`, `registry-row-action-button.component.spec.ts`, `registry-action-icons.spec.ts`, `app-shell-registries-nav.spec.ts`, `composition-registries.spec.ts`); full `kppdf-web` suite 82/83 passing (the 1 failing suite, `app-shell.component.spec.ts`, is pre-existing/unrelated — see below); full `features` suite 49/49
- [x] nx build last 0

## Pre-existing failures disclosed (not mine, not fixed)

`app-shell.component.spec.ts` — 2 tests fail on quicknav chip count
(`Expected: 8, Received: 9` / `Expected: 7, Received: 8`). Confirmed via
`git stash` isolation **before** this TZ's own code changes that these 2
failures (plus a since-resolved 3rd, `home.page.spec.ts`'s `NG0201`) exist
independently of both the bulk-delete recovery and this TZ's move — they
belong to the concurrently-claimed `TZ-NX-HOME-ROUTE-SHELL` task (conflict
keys `app.routes.ts`/`nav-categories.ts`/`pages/home/**`, a different
agent session, `_NOW.md`'s `CLAIMED` line at claim time), which is adding a
new nav chip and hasn't updated this count assertion yet. Not touched —
outside this TZ's conflict keys and not my claim.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no registries behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route/behavior change)
- [x] page.md / PAGE-TZ-INDEX — N/A (import path only; also PAGE-TZ-INDEX.md is in the concurrent session's conflict keys — left untouched)
- [x] DOMAIN-MAP — N/A (import path changed, no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged: registries-platform/** (new), the 68 fixed import sites, tsconfig.base.json + this checklist/tracker/task marker — nothing from the concurrent home-route-shell claim)
- [x] Coupling map — N/A (registry contract shape unchanged, only its location)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0, bundle 503.71 kB (post bulk-delete-recovery baseline)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/pages/registries/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle 504.00 kB (+0.29 kB, negligible — new lib-boundary indirection; `registries-page` lazy chunk unchanged 110.89 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → 82/83 suites, 555/564 passed, 7 skipped, 2 failed (both pre-existing/unrelated, disclosed above) — all 29 registries-scoped suites individually confirmed PASS
- `cd frontend-nx && pnpm exec nx test features` (full suite) → PASS (49/49 suites, 442/442 passed)
- `pnpm architecture:check` → PASS (1554 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 504.00 kB)

## Executor report

Что сделано: перенёс `registry.types.ts` (235 LOC, канонический контракт
всей платформы `/registries`) + `registry-query-state.ts` (+spec) в новый
`libs/features/src/lib/registries-platform/` (`@kppdf/features/registries-platform`)
и починил все 68 точек импорта скриптовой заменой пути с последующей
ручной проверкой на дублирующиеся import-statement'ы (нашёл и смёрджил
один такой случай). Это разблокирует следующую TZ этой волны
(`TZ-NX-REGISTRY-DETAIL-TO-FEATURES`), заблокированную ровно этим файлом
в B8.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio Cursor WIP, PO-CANON/DOMAIN-MAP и т.д., и конкурентная claim-сессия
`TZ-NX-HOME-ROUTE-SHELL` на `app.routes.ts`/`nav-categories.ts`/`pages/home/**`)
не трогал.

Known limits: 2 предсуществующих теста в `app-shell.component.spec.ts`
падают из-за незавершённой конкурентной сессии (новый nav-чип «Дом», счётчик
устарел) — не моя задача, не мой claim, не трогал.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15

## Post-hoc disclosure — cross-agent commit contamination

The code + this checklist + the `tasks/_active/` marker for this TZ were
**not** committed by me directly — they landed inside a concurrent agent's
commit `f5fb1f3a` ("feat(nx-home): add live order queue and shared hub
reuse", authored by a different autonomous tool — "Codebuff", same
`agent_id: claude` convention in its own claim markers — which is
independently committing to `main` in this same working directory).
That agent's own `git add` was evidently broad enough to sweep up my
then-uncommitted, unstaged `registries-platform` move alongside its
unrelated home-page work. Content verified identical to what gates
validated in this checklist — nothing lost or altered, just misattributed
in history. No rewrite attempted (shared branch, another agent actively
committing — rewriting history here would be destructive and was avoided
per standing policy). Disclosed here and to the PO directly. From this
point forward in this session: committing immediately after each TZ's
edits (not batching), and re-checking `git log -1`/`tasks/_active/` state
before every `git add`/commit to catch further interleaving early.
