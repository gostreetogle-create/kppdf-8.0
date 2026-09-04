# TZ-NX-GANTT-G1-SHELL-ROUTE checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G1-SHELL-ROUTE.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T22:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — чужие active: TZ-NX-DOCSTUDIO-S37 (DocStudio keys); пересечений с моими keys нет
- [x] TZ / канон / deps прочитаны (G0 audit, UX spec, page.md, studio-editor setTools/clear, app-shell, route-paths, capability guard)
- [x] Claim slot заполнен; Status = CLAIMED → DONE
- [x] `tasks/_active/TZ-NX-GANTT-G1-SHELL-ROUTE.md` был на месте (заархивирован)

## Acceptance

- [x] 1. Route `/production` под app shell с `pageKey: production`, `capabilities: ['production:read']` (уже в metadata), lazy `ProductionCockpitPage`
- [x] 2. Nav-чип «Гант» виден и ведёт на `/production` (route появился в `collectPageRoutePaths`; spec подтверждает entryPath)
- [x] 3. `nx build kppdf-web` PASS (exit 0, LAST)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (новая NX страница + route + chrome tools)
- [x] FIC §A: route + pageKey + capabilities — пройден (data.pageKey production, capabilities production:read существуют в metadata; pageKey совпадает с nav-categories)
- [x] page.md / PAGE-TZ-INDEX: N/A — страница stub, полноценная документация — G7
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (использовано site-префикс-cedly: только мои файлы)
- [x] Coupling map: N/A (общие статусы не трогались)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (кэш)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (S37 — doc-studio зона)
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
→ PASS, exit 0

pnpm exec jest apps/kppdf-web/src/app/pages/production apps/kppdf-web/src/app/layout/{route-paths,app-shell,app-shell-constructor-nav}.spec.ts
→ PASS, 4 suites / 24 tests (incl. 4 новых на production page)

pnpm exec nx build kppdf-web
→ PASS, exit 0 (LAST)
```

## Executor report

- Создан `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts` — stub shell: RU заголовки «Производство · Гант», placeholder «План-оценка загружается в следующих шагах волны (G2–G6)», чтение `?orderId=` / `?from=desk`, регистрация chrome tools через `ShellToolRailService` (owner `production`): left Заказы/Фильтры/Обновить, right Сегодня — enabled, handlers no-op до G3/G4, `clear('production')` on destroy (эталон — studio-editor).
- Route добавлен в `app.routes.ts` под app shell: `canMatch: [capabilityRouteGuard]`, `data: { pageKey: 'production', capabilities: ['production:read'] }`, lazy import.
- Тесты: `production-cockpit.page.spec.ts` (новый, 4 кейса: рендер, регистрация инструментов, deep-links, cleanup), `route-paths.spec.ts` (+/production, /work-types=false), `app-shell.component.spec.ts` (чипы 4→5, production entryPath).
- Conflict disclosure: не трогал nav-categories (route-появление само активирует чип), не трогал capability metadata (production:read уже есть).
- Known limits: handlers инструментов — no-op (G3/G4); `production:write` capability проверим в G5.

## Review handoff

- [x] N/A — волновая TZ без Cursor review inbox (MASTER цикл: gates → archive → commit/push)

## Closeout (после PASS)

- [x] archive + удалить `_active`; Status = DONE
- closed_at: 2026-09-04T23:00:00+03:00