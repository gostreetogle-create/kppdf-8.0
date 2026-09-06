# TZ-NX-GANTT-LEGACY-DECOMMISSION: снос legacy Gantt (`frontend/` `/production`)

> **Для PO (смысл простым языком):** [`docs/PO-PLAIN-LANGUAGE-CHANGES.md`](../../../docs/PO-PLAIN-LANGUAGE-CHANGES.md)

**СТАТУС:** SUPERSEDED 2026-09-05 — не continuous; см. `TZ-NX-GANTT-LEGACY-DECOMMISSION.md` (pointer)  
**РОЛЬ АГЕНТА:** Executor (frontend legacy + docs)  
**LAYER:** 2  
**PAGES:** production  
**PAGE_DOCS:** `docs/pages/production-cockpit.page.md`  
**ЗАВИСИМОСТИ:** NX Gantt G0–G7 live PASS (`188f26dd`+); желательно polish P5 (G10 thumbs) уже на main, чтобы NX = полный SoT  
**CONFLICT KEYS:** `frontend/src/app/app.routes.ts`; `frontend/src/app/pages/production/**`; `frontend/src/app/pages/work-types/work-types.page.ts`; `frontend/src/app/layout/app-layout.component.ts` (nav chip production — только если ломается без route); `docs/pages/production-cockpit.page.md`; `docs/pages/PAGE-TZ-INDEX.md`  
**IMPLICIT:** `frontend-nx/**` не трогать (SoT живой); `backend/**` не трогать

**Проверено:** NX route `frontend-nx/.../app.routes.ts` path `production`; legacy `frontend/.../app.routes.ts:377`; единственный cross-import в продукт: `work-types.page.ts` → `../production/production-group-chips`. Desk/tray/layout линкуют `/production` внутри legacy SPA — после сноса нужен stub, не голый 404.

## ИСХОДНОЕ

- Живой Гант: только NX `:4201/production`.
- Legacy папка `frontend/src/app/pages/production/**` (~15 файлов) — дубль порта.
- `PRODUCTION_SECTION_CHIPS` живут в legacy production и импортятся с `/work-types`.
- PO: **Да** на decommission (2026-09-05).

## ЧТО ДЕЛАТЬ

1. **Вынести chips:** перенести `production-group-chips.ts` (или эквивалент) в нейтральное место, напр. `frontend/src/app/pages/work-types/production-section-chips.ts` или `frontend/src/app/shared/...`, обновить import в `work-types.page.ts`. Chip «Гант» может вести на `/production` (stub) или на внешний NX URL — по умолчанию оставить `/production` → stub (см. шаг 3).
2. **Удалить** legacy Gantt-дерево: `production-cockpit.page.*`, `production-read.facade.*`, `production-cockpit.context.*`, `gantt-bar.model.*`, `blocks/gantt-bars.*`, `blocks/orders-rail.*`, `blocks/order-inspector.*`, `blocks/production-scale-controls.*` (+ их `*.spec.ts`). Не оставлять мёртвых re-export.
3. **Stub route** (не silent 404): заменить lazy `ProductionCockpitPage` на тонкую страницу-заглушку RU: «Производство (Гант) ведётся в NX-приложении — откройте порт **4201**, путь `/production`» + опционально `window.location` / `<a href="http://localhost:4201/production">` для local. `pageKey`/`capabilities`/`title` сохранить, чтобы nav/desk/tray не падали. Файл stub — рядом, напр. `production-moved.page.ts` (без Gantt).
4. **Nav:** `app-layout` entry `production` оставить, если stub на месте; не плодить второй пункт меню.
5. **Docs:** `production-cockpit.page.md` — SoT = только NX; секция legacy → «REMOVED <SHA>»; убрать фразу «не удалять до решения PO». `PAGE-TZ-INDEX` — строка decommission DONE. Короткий audit `docs/audits/2026-09-05-gantt-legacy-decommission.md` (что удалено, stub, gates).
6. Gates:  
   `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint`  
   Убедиться, что нет broken imports на удалённые production-файлы (`rg "pages/production/"` по `frontend/src` — только stub + перенесённые chips).

## НЕ ИЗМЕНЯТЬ

- `frontend-nx/**` (живой Гант)  
- Backend estimate/order APIs  
- Исторические audits / `production-gantt-studio-spec.md` (можно одну строку «implementation SoT = NX»)  
- Wipe БД, docker ports чужих сервисов  
- Снос всего legacy `frontend/` приложения — только production Gantt

## Сбои процесса (N/A продукт-данные)

Это delete UI-дубля. Операторы на legacy `:4200`: desk «Открыть производство» → stub с явным указанием NX, не пустой экран.

## КРИТЕРИИ ПРИЁМКИ

1. `frontend/src/app/pages/production/` не содержит Gantt/cockpit/facade/bars — только stub (± chips если не вынесли).  
2. `/work-types` собирается и показывает section chips.  
3. Legacy `/production` открывается без runtime error и ясно говорит, что SoT = NX `:4201`.  
4. Desk/tray ссылки на `/production` не 404.  
5. Gates frontend зелёные.  
6. Docs + audit обновлены.

## known_limitation

- Полный cutover пользователей на NX-only host/nginx — отдельно (deploy), не этот TZ.  
- Legacy desk остаётся на `:4200`; deep-link в NX — local stub URL, не SSO.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-GANTT-LEGACY-DECOMMISSION.done.md`  
WAVE: отметить P6 `[x]`.
