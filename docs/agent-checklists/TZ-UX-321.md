# TZ-UX-321 checklist

> Status: **READY FOR CLAIM** (spec rewritten 2026-08-15 — universal rail, not pixel nudge)
> Goal: левая chrome-панель ~1.5–2 см; ←→ внутри; фильтр = successor
> Deploy: НЕ
> Quality bar: ≥98 (PO visual vs red outline)

## Claim slot

- agent_id:
- claimed_at:
- workspace:
- branch: feature/TZ-UX-321-universal-chrome-rail
- team_room_claim:

## Preflight

- [ ] Isolated worktree from origin/main
- [ ] Read **rewritten** TZ (universal panel) — ignore old calc(50%-700px) draft
- [ ] Conflict keys free vs FRONTEND-304

## Acceptance

- [ ] `data-test="app-chrome-rail-left"` 56–72px, under header, brand vertical
- [ ] ←→ children of rail; no floating edge buttons
- [ ] ≥1680 show / narrow hide
- [ ] Spec + tsc PASS
- [ ] Browser 1920 smoke + screenshot path
- [ ] Self-score ≥98; filter NOT moved
- [ ] Docs + archive + lock; deploy НЕ

## Executor report (auto)

_(fill on DONE)_
