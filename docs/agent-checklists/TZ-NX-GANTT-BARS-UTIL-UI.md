# TZ-NX-GANTT-BARS-UTIL-UI checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-GANTT-BARS-UTIL-UI.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T02:52:08Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (A1 archived, no conflicts)
- [x] TZ / канон / deps прочитаны (`TZ-NX-GANTT-BARS-UTIL-UI.md`, depends on A1 archived — confirmed `0b05d437`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-GANTT-BARS-UTIL-UI.md` на месте

## Investigation (no code change)

1. **Duplication check** — compared `gantt-bar.model.ts` (1459 LOC, pure
   estimate/tree-building model, TZ-PRODUCTION-30x/34x) against the new
   `gantt-bars.constants.ts` (237 LOC, from A1: px/layout constants, hue
   buckets, drag-snap helpers, `Gantt*Commit`/`GanttOrderMetaView` DTOs).
   **No overlapping exports found** — the two files are complementary, not
   duplicated. Nothing to move per AC item 1.
2. **Optional presentational extracts** — TZ text explicitly frames this as
   optional and names two examples:
   - `production-scale-controls.component.ts` — **already** a separate
     102-LOC dumb component (`app-production-scale-controls`, group-by +
     zoom/fit toolbar). Confirms this half of the TZ's suggestion is already
     done, from before this pack.
   - "unassigned banner" (`data-test="gantt-unassigned-banner"`, ~15 LOC
     template fragment bound to `facade.unassignedSummary()` +
     `GANTT_UNASSIGNED_CHIP_FILL`) — **PARKed**. It is a single-use fragment
     tightly coupled to facade state; extracting it into its own component
     would add a new file/selector for no LOC-reduction benefit and no reuse
     site, and risks touching markup the wave's hard rule protects ("No
     Gantt geometry/behavior change"). Not worth it standalone.
   - Deep bar-layer (row/timeline rendering) split: explicitly out of scope
     per TZ text ("do not force micro-split of bars layer yet (PARK deep
     bar-layer split)") — left for a future wave beyond A4, since A4 only
     relocates to `libs/features`, it doesn't restructure further.
3. **Imports/selectors** — unchanged (nothing moved), so N/A.

Conclusion: this TZ's AC is satisfied by verification, not by new code.
No files touched beyond this checklist.

## Acceptance

- [x] Specs: gantt* + production-cockpit* green
- [x] nx build last 0
- [x] Document in checklist what stayed PARK for deep UI split (see Investigation above)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (verification-only, no product code changed)
- [x] FIC §A–E — N/A (no page/permission/module/MCP surface touched)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (no product files touched this TZ)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build already green from A1 closure (no code changed in A2)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0 (cache-hit, no source changed)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=gantt` → PASS (117/117 suites, 840/847 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0, cache-hit — no source changed since A1)

## Executor report

Что сделано: проверил AC этого TZ (duplication check между `gantt-bar.model.ts`
и `gantt-bars.constants.ts` — не найдено; presentational extract кандидаты
рассмотрены и осознанно оставлены PARK с обоснованием). Кода не менял — TZ сам
формулирует шаги 1–2 как optional/"do not force". Прогнал gates заново для
подтверждения. Conflict disclosure: не относящиеся к этому TZ uncommitted
файлы в дереве (studio/docs/audits/data) не трогал.

Known limits: `gantt-bars.constants.ts` временный (см. его собственный
docstring) — полный перенос в `@kppdf/features/production/util` происходит в
A4 (`TZ-NX-PRODUCTION-TO-FEATURES`), не здесь.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
