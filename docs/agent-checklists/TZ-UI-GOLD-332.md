# TZ-UI-GOLD-332 checklist

> Status: **DONE (scoped acceptance)**
> TZ: `tasks/_backlog/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.md`
> Prompt: `tasks/prompts/TZ-UI-GOLD-332-PROMPT.md`
> Commit: `237449e1` · push: **yes** (final checkpoint pending)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T02:55:00Z
- closed_at: 2026-08-09T02:53:59Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — registry reports Unknown task `TZ-UI-GOLD-332`
- baseline: `bf59a0cc`, synchronized with `origin/main`

## Pre-flight

- [x] TZ-UI-THEME-331 is DONE and archived (`bf59a0cc`)
- [x] `--color-on-gold` exists in `frontend/src/styles.css`
- [x] `_active/` checked; no conflicting active claim
- [x] Doc-tables READY files do not claim these conflict keys
- [x] Exact replacement scope and bans read
- [x] `verify-status.sh` baseline recorded: pre-existing 72 legacy mismatches
- [x] Baseline full Jest: 136 suites / 1276 tests PASS
- [ ] Before screenshots recorded (browser session unavailable)

## Acceptance

- [x] Light gold fill and aliases match requested values
- [x] `--color-gold-deep` is declared with the requested light and dark values
- [x] Focus ring, ink borders/rings, input focus and edit icon use `gold-deep`
- [x] The three requested page roles use `text-gold-deep`; translucent backgrounds remain unchanged
- [x] Selected row hover uses the requested 10% light-gold mix
- [x] Dark theme is unchanged except the specified `gold-deep` override
- [x] `docs/paper-and-ink.md` contains the two-role gold section
- [x] tsc, full Jest and Angular development build pass
- [ ] Global `text-sunrise-warm` search is not zero: 22 existing files remain outside the four explicitly allowed product files; not touched per scope ban
- [ ] Browser visual acceptance (no browser session available)

## Gates (fact)

- [x] Changed-file Prettier — PASS
- [x] Changed-file ESLint — PASS
- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] Baseline full Jest — 136 suites / 1276 tests PASS
- [x] Final full Jest — 136 suites / 1276 tests PASS; existing Angular/jsdom console warnings remain
- [x] `pnpm exec ng build --configuration=development` — PASS
- [x] `git diff --check` — PASS

## Scope finding

The requested three page replacements and the extra warning text in `product-bom-panel` are complete. The literal global control search still finds `text-sunrise-warm` in pre-existing files outside this TZ's explicit file list (design, desktop pairing, multiple dictionaries/catalog pages, orders, shipping, supply, and shared UI). A global sweep requires a separate PO-authorized TZ because this task bans edits outside `styles.css`, the three pages, and `docs/paper-and-ink.md`.

## Closeout

- [x] progress.md / STATUS.md / `_active-map.md` checkpoint — `237449e1`
- [x] `.mimocode/locks/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.lock`
- [x] `tasks/_archive/2026-08/TZ-UI-GOLD-332.done.md`
- [x] remove `tasks/_active/TZ-UI-GOLD-332.md`
- [x] implementation commit + push; final checkpoint commit pending
