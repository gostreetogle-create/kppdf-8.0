# Checklist — TZ-UI-DCI-602

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-UI-DCI-602.done.md` (active marker removed)
> Spec: `tasks/TZ-UI-DCI-602-focus-segmented.md`
> Conflict keys: `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`; `docs/DARK-THEME.md`; `docs/paper-and-ink.md`; `frontend-nx/apps/kppdf-web/src/app/pages/kit/`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `claude`
- claimed_at: `2026-08-31T20:07:13+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (CLI недоступен)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_NOW.md` + `tasks/_active/` — на момент claim нет чужого CLAIM на global.css / kit
- [x] Прочитаны TZ, `docs/audits/2026-08-31-dark-control-interface-audit.md` § A2/A5, `docs/DARK-THEME.md`, `docs/paper-and-ink.md`, `docs/ui-rules.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-DCI-602.md` создан и удалён после архивации
- [x] Baseline `nx build kppdf-web`: exit 0

### Preflight Check Output

- **Context read:** `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `tasks/_active/`, `tasks/TZ-UI-DCI-602-focus-segmented.md`, `docs/audits/2026-08-31-dark-control-interface-audit.md`, `docs/DARK-THEME.md`, `docs/paper-and-ink.md`, `docs/ui-rules.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/DOCS-INTEGRITY.md`, `docs/GIT-POLICY.md`
- **Key Constraints:** frontend-nx only; preserve `.pi-focus-ring` token model and do not add global `:focus-visible` outline; tri-state active combines background + gold-ish border + readable ink in light/dark; no violet/ice/Onest; avoid production/combine/studio business pages.
- **Planned Deliverable:** baseline build; inspect kit controls and existing segmented classes; make the smallest CSS/class/passport/doc changes; verify light/dark and keyboard semantics; run gates and archive.
- **Validation Path:** TZ acceptance criteria + `nx build kppdf-web` as final gate; optional `paper-and-ink` tests; browser/DOM checks for kit keyboard and theme behavior; Integrity slot and focused diff review.

## Acceptance

- [x] Tab → visible gold-deep focus on segmented/chip in kit: `pi-focus-ring` added to kit links, theme toggle, and Foundations segmented demo
- [x] Active segmented: bg + border + ink (light + dark): `.pi-segmented-item[aria-pressed='true']` uses gold mix + gold-deep border + ink
- [x] Нет двойного ring на pi-input / pi-icon-btn: no global `:focus-visible` rule added; existing built-in rules unchanged
- [x] DARK-THEME § Segmented: explicit tri-state rule added
- [x] Kit passport comment: Foundations JSDoc documents `pi-segmented` / `pi-segmented-item`

## Integrity slot (до READY / archive)

- [x] Тип: `other` (CSS tokens + docs)
- [x] FIC: N/A — нет route, capability, permission, module или MCP
- [x] page.md / PAGE-TZ-INDEX: N/A — existing kit page only, no new route
- [x] SECTION-READINESS: N/A — no product section
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling: N/A — no shared domain field/status changed
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Build integrity

- [x] Baseline build green — `cd frontend-nx && pnpm exec nx build kppdf-web`, exit 0 (2026-08-31; existing Angular warnings only)
- [x] Нет параллельного `_active` на `apps/kppdf-web/src/**` на claim
- [x] Закрытие: `nx build kppdf-web` — последняя code gate, exit 0

## Gates (факт)

- [x] Baseline `nx build kppdf-web`: exit 0 (2026-08-31)
- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: exit 0
- [x] `pnpm exec nx test paper-and-ink`: exit 0 (31 suites / 332 tests)
- [x] Changed-file `pnpm exec eslint ...`: exit 0
- [x] Primary kit/DOM verification: PASS (light/dark computed styles and `aria-pressed` round-trip)
- [x] Final `pnpm exec nx build kppdf-web`: exit 0
- [ ] Full `nx lint kppdf-web`: exit 1 due pre-existing 21 Studio template/component errors outside this TZ
- [x] Source `git diff --check`: exit 0; dirty pre-existing docs whitespace is disclosed in archive

## Executor report (auto)

```
outcome: DONE
commit: `066b7ef8` (pushed to origin/main)
gates: tsc PASS; paper-and-ink 332/332 PASS; changed-file eslint PASS; kit DOM PASS; nx build PASS; full app lint pre-existing FAIL disclosed
archive: tasks/_archive/2026-08/TZ-UI-DCI-602.done.md; lock .mimocode/locks/TZ-UI-DCI-602-focus-segmented.lock
known_limits: browser console had expected local /api/auth/refresh 500 without backend; existing Angular/jsdom/build warnings remain.
```

## Review handoff

- [x] Focused diff reviewed; no global `:focus-visible` rule, forbidden palette, or business-page scope creep
- [x] No Cursor/PO review gate required by this executor wave

## Closeout

- [x] archive + lock + progress/status synchronization complete in the DCI wave closeout
- [x] Status = DONE
- closed_at: `2026-08-31`
