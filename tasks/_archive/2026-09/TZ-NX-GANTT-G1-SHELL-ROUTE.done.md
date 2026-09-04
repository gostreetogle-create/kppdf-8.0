# TZ-NX-GANTT-G1-SHELL-ROUTE: маршрут /production + shell

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** production
**PAGE_DOCS:** `docs/pages/production-cockpit.page.md`
**DEPENDENCIES:** G0
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/production/**` (shell only); `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` (не потребовалось); IMPLICIT `nx build kppdf-web`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T22:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight Check Output

- **Context read:** `tasks/_ready/nx-gantt/TZ-NX-GANTT-G1-SHELL-ROUTE.md`, `docs/audits/2026-09-04-gantt-nx-port-audit.md`, `docs/ux/production-gantt-studio-spec.md`, `docs/pages/production-cockpit.page.md`, `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `layout/nav-categories.ts`, `layout/shell-tool-rail.service.ts`, `layout/tool-rail-definitions.ts`, `layout/route-paths.ts`, `pages/studio/studio-editor.page.ts` (эталон setTools/clear), `layout/app-shell.component.ts`, `pages/orders/orders-list.page.ts` (стиль страниц), `_NOW.md`, `tasks/_active/*`.
- **Key Constraints:** chrome = `ShellToolRailService` (не PiChromeTools); handlers no-op до G3/G4, но **не** disabled placeholders; `clear('production')` on destroy; не трогать nav-categories (route сам включает чип); `production:read` уже в metadata.
- **Planned Deliverable:** route `/production` (pageKey production, capabilities production:read, lazy) → stub ProductionCockpitPage (RU, body-место, deep-link чтение, shell tools) → spec-адаптация (route-paths, app-shell chips) + новый page spec → gates (tsc/jest/nx build LAST).
- **Validation Path:** FIC §A (новая страница) + Build integrity (baseline → LAST build).

## Что сделано

1. `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts` (новый): stub-страница с RU-заголовком «Производство · Гант», placeholder «План-оценка загружается в следующих шагах волны (G2–G6)», чтение deep-link `?orderId=` / `?from=desk`; регистрация chrome tools через `ShellToolRailService` (`setTools('production', {left: Заказы/Фильтры/Обновить, right: Сегодня})`) — кнопки **enabled**, onClick no-op до G3/G4; `onDestroy → clear('production')`. Стили: full-height body `production-studio-body` (relative/overflow hidden — как frozen contract).
2. `app.routes.ts`: route `production` под app shell — `canMatch: [capabilityRouteGuard]`, `data: { pageKey: 'production', capabilities: ['production:read'] }`, lazy `ProductionCockpitPage`.
3. Спеки:
   - `production-cockpit.page.spec.ts` (новый, 4): рендер RU-заголовков; набор инструментов слева/справа и enabled; deep-link `?orderId=`; clear на destroy.
   - `route-paths.spec.ts`: `/production` → true, `/work-types` → false (пара).
   - `app-shell.component.spec.ts`: чипов 4→5, assert Цех entryPath `/production` (через navCategories, т.к. в этом спец routerLink не рендерится — imports очищены).
4. nav-categories не менялся: route-появление само включает чип «Гант» через `collectPageRoutePaths`.

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
→ PASS, exit 0

pnpm exec jest apps/kppdf-web/src/app/pages/production apps/kppdf-web/src/app/layout/{route-paths,app-shell,app-shell-constructor-nav}.spec.ts
→ PASS, 4 suites / 24 tests

pnpm exec nx build kppdf-web
→ PASS, exit 0 (LAST)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (route открывается под auth по route-контракту; чип «Гант» виден и ведёт на `/production`; nx build exit 0)
  - typecheck: PASS (app tsconfig)
  - tests: PASS (4 suites / 24 tests, включая новые)
  - lint: N/A (nx lint имеет pre-existing baseline по S41/S37B; новые файлы консистентны с эталонами, tsc строг)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-GANTT-G1-SHELL-ROUTE.md`)
  - progress.md: REDIRECT (статус — `_NOW.md` / QUEUE-LIVE)
  - status synchronization: PASS