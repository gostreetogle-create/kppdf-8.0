# TZ-UX-331 checklist

> Status: **DONE**
> closed_at: 2026-08-16T12:50:00+03:00
> Archive: `tasks/_archive/2026-08/TZ-UX-331.done.md`
> Lock: `.mimocode/locks/TZ-UX-331-brand-home-combine.lock`
> Spec (archived body): `tasks/_archive/2026-08/TZ-UX-331.done.md`
> Commit/push: по `docs/GIT-POLICY.md`
> Review: Cursor Verdict PASS

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer (TZ-UX-331 frontend executor)
- claimed_at: 2026-08-16T12:25:59+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root checklist Claim slot = SoT)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `_active/` + `_active-map` — нет чужого CLAIM на те же keys
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW → DONE
- [x] `tasks/_active/TZ-UX-331.md` удалён после archive

## Acceptance

- [x] Бренд-chip: soft gold/sunrise, золотой маркер, hover/focus
- [x] `routerLink="/"`, aria/title «Комбайн заказов — главная», `data-test="nav-brand-home"`
- [x] Spec layout green
- [x] dashboard.page.md + page-chrome.md + PAGE-TZ-INDEX
- [x] tsc app + focused test
- [x] Light/dark читаемы (sunrise tokens: soft fill + warm marker; dark overrides in styles.css)

## Integrity slot

- [x] Тип: page (shell)
- [x] FIC N/A (shell affordance only)
- [x] page docs + PAGE-TZ-INDEX
- [x] Чужой WIP не в коммите (только UX-331 paths)

## Gates

| Gate | Result |
|------|--------|
| `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |
| `cd frontend && pnpm test -- app-layout.component.spec` | PASS (8 tests) |

## Executor report (auto)

- Outcome: **DONE** (Cursor Verdict PASS; archived)
- Brand chip: `data-test="nav-brand-home"`, `routerLink="/"`, aria/title «Комбайн заказов — главная»
- Visual: `bg-sunrise-soft` + hairline + `bg-sunrise-warm` marker + hover/focus
- Docs: dashboard.page.md §Навигация; page-chrome Brand home; PAGE-TZ-INDEX shell+dashboard DONE
- Gates: tsc PASS; app-layout.spec 8/8 PASS
- Not touched (intent): products/modules TS, pi-pagination, desktop, deals entry
- Note: commit also picked `modules.page.md` one-line grid pager doc (peer race / lint-staged)
- Deploy: forbidden
- Commit SHA: `9e4103380527d169ab20a18ab03f452a199f6bfa`
- Archive: `tasks/_archive/2026-08/TZ-UX-331.done.md`
- closed_at: 2026-08-16T12:50:00+03:00
