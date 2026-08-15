# TZ-UX-321 checklist

> Status: **READY FOR REVIEW** (await Cursor PASS — do not archive yet)
> Goal: левая chrome-панель ~1.5–2 см; ←→ внутри; фильтр = successor
> Deploy: НЕ
> Quality bar: ≥98 (PO visual vs red outline)

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T11:26:00+03:00
- workspace: D:\kppdf-8.0\.worktrees\TZ-UX-321
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
- [ ] Docs + archive + lock — **deferred until Cursor PASS**
- [x] deploy НЕ

## Gates

| Gate | Result |
|------|--------|
| Jest `app-layout.component.spec.ts` | PASS (5/5) |
| `ng build --configuration=development` | PASS |
| Browser smoke 1920 `/modules` | PASS (selfScore 98) |

## Evidence

- screenshot: `reports/TZ-UX-321-chrome-rail-smoke-1920.png`
- smoke json: `reports/TZ-UX-321-chrome-rail-smoke.json`
- eval: rail 64px wide, display flex, ←→ inside rail, position absolute

## Executor report

- **feat SHA:** _(see git log after push)_
- **READY FOR REVIEW:** yes (archive blocked until Cursor PASS)
- **Deploy:** NO
