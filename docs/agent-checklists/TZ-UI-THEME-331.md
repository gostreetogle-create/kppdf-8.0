# TZ-UI-THEME-331 checklist

> Status: **DONE**
> TZ: `tasks/_backlog/TZ-UI-THEME-331-dark-depth-and-on-gold.md`
> Prompt: `tasks/prompts/TZ-UI-THEME-331-PROMPT.md`
> Commit/push: **pending closeout**

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T02:41:18Z
- closed_at: 2026-08-09T02:46:59Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — registry reports Unknown task
- baseline: `main` at `56197a13`, synchronized with `origin/main`

## Pre-flight

- [x] TZ-UI-LIGHT-330 is DONE and archived (`35cfc6e3`)
- [x] `--color-paper-raised-override` exists in `frontend/src/styles.css`
- [x] `--color-on-gold` was absent before implementation
- [x] `_active/` and `_active-map.md` checked; no conflicting claim
- [x] Exact replacement scope and bans read before product edits
- [x] Team Room claim attempted; registry reports Unknown task
- [x] Baseline focused command recorded: requested patterns have no matching specs and exit 1 without `--passWithNoTests`
- [ ] Before screenshots recorded (browser session unavailable)

## Acceptance

- [x] `--color-on-gold` is declared and default button uses `text-on-gold`
- [x] No opaque `bg-sunrise-warm text-paper` remains in `frontend/src`; the discovered kit-layout occurrence was included
- [x] Every conditional `bg-sunrise-warm` has matching `text-on-gold`
- [x] Dark surface ladders, text calibration, inset highlight and scrollbar changes applied exactly
- [x] Light selection and dark scrollbar rules are correct
- [x] `--color-muted-strong` is absent from frontend source
- [x] `docs/DARK-THEME.md` contains the requested depth and on-gold section
- [x] Full frontend gates pass without test failures
- [ ] Visual screenshots and PO visual review

## Gates (fact)

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] Focused Jest command — PASS with `--passWithNoTests`; no matching specs exist
- [x] `pnpm exec jest --no-coverage --runInBand` — 136 suites / 1276 tests PASS; existing jsdom/Angular console warnings remain
- [x] `pnpm exec ng build --configuration=development` — PASS
- [x] Changed-file ESLint — PASS
- [x] Changed-file Prettier — PASS
- [x] `git diff --check` — PASS

## Closeout

- [x] progress.md / STATUS.md / `_active-map.md` checkpoint — pending final commit SHA
- [x] `.mimocode/locks/TZ-UI-THEME-331-dark-depth-and-on-gold.lock`
- [x] `tasks/_archive/2026-08/TZ-UI-THEME-331.done.md`
- [ ] remove `tasks/_active/TZ-UI-THEME-331.md`
- [ ] commit + push
