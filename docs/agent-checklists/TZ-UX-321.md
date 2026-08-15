# TZ-UX-321 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-UX-321.done.md`
> Lock: `.mimocode/locks/TZ-UX-321-universal-left-chrome-rail.lock`
> Deploy: NO

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T11:26:00+03:00
- closed_at: 2026-08-15T14:35:00Z
- workspace: D:\kppdf-8.0
- branch: feature/TZ-UX-321-universal-chrome-rail
- team_room_claim: unavailable (Unknown task in Team Room)

## Preflight

- [x] Isolated worktree from origin/main
- [x] Read **rewritten** TZ (universal panel) — ignore old calc(50%-700px) draft
- [x] Conflict keys free vs FRONTEND-304 / AUTH-305 / HUB-303 (layout-only zone)

## Acceptance

- [x] `data-test="app-chrome-rail-left"` 64px, under header, brand vertical (left matches pi-page-frame padding)
- [x] ←→ children of left rail; no floating fixed edge buttons
- [x] ≥1680 show / narrow hide (`@media min-width 1680px`)
- [x] Spec + ng build PASS
- [x] Browser 1920 smoke + screenshot path (see below)
- [x] Self-score 98; filter NOT moved
- [x] Docs + archive + lock
- [x] deploy НЕ

## Gates

| Gate | Result |
|------|--------|
| Jest `app-layout.component.spec.ts` | PASS (5/5) |
| `ng build --configuration=development` | PASS |
| Browser smoke 1920 `/modules` | PASS (selfScore 98) |
| Cursor Verdict | PASS |

## Evidence

- screenshot: `reports/TZ-UX-321-chrome-rail-smoke-1920.png`
- smoke json: `reports/TZ-UX-321-chrome-rail-smoke.json`
- eval: rail 64px wide, display flex, ←→ inside rail, position absolute

## Executor report

- **feat SHA:** `21f32f11317d79d25e05b651f320579e407d3bf3`
- **merge SHA:** `85dbcc57cb2174fa750c27b425e6319baba8b30a`
- **closeout SHA:** `099de456d9127c91acabb313e3937d3f57fbc4d7`
- **Cursor Verdict:** PASS
- **Deploy:** NO
