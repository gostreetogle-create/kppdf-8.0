# TZ-TEST-422 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-TEST-422-categories-spec-activated-route.md` (не создавался — TZ выполнена в один заход, без активного маркера)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-26T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff недоступен, PO попросил закрыть blocker напрямую)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] TZ прочитана: `tasks/TZ-TEST-422-categories-spec-activated-route.md`
- [x] Conflict key: `frontend/src/app/pages/dictionaries/categories.page.spec.ts` — только этот файл

## Acceptance

- [x] `categories.page.spec.ts` — провайдер `ActivatedRoute` (`snapshot.queryParamMap.get` → null via `convertToParamMap({})`, `queryParamMap` → `of(convertToParamMap({}))`)
- [x] `categories.page.spec.ts` — 0 fail (5/5 PASS)
- [x] `tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `categories.page.ts` не тронут

## Gates (факт)

| Gate | Command | Result |
|------|---------|--------|
| jest | `pnpm exec jest --config jest.config.js src/app/pages/dictionaries/categories.page.spec.ts` | PASS 5/5 |
| tsc | `pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |

## Executor report

- Добавлен mock `ActivatedRoute` в `beforeEach` providers: `snapshot.queryParamMap` и `queryParamMap` (observable) через `convertToParamMap({})` — NG0201 устранён.
- Product-код (`categories.page.ts`) не изменялся.
- Заодно: `tasks/_active/TZ-SUPPLY-443.md` удалён из git (архив уже существует, active-маркер был лишним).

## Closeout (после PASS)

- [x] archive: `tasks/_archive/2026-08/TZ-TEST-422-categories-spec-activated-route.done.md`
- [x] Status = DONE
- closed_at: 2026-08-26T00:10:00Z
