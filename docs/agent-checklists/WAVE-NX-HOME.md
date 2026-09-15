# WAVE-NX-HOME — страница «Главная» (`/home`)

**Статус:** DONE (route/hub/chips landed). Follow-ups S: `TZ-NX-HOME-BREADCRUMB-EDIT-CTA` (DONE, `6f0eeb79`) → `TZ-NX-HOME-CHROME-TOP` (DONE — layout gap left by breadcrumb TZ: dup eyebrow removed, workflow chips moved into `PiGroupWorkspace` sticky `[chips]`)  
**Источник макета:** `data/kppdf-цеховой-erp-—-макет-связей.zip` → `data/_tmp-maket-svyazey/`  
**Page:** `docs/pages/home.page.md`  
**Канон связей:** `docs/audits/2026-09-15-ui-related-display-peer-verdict.md`

## Цель

Новый NX-модуль **Главная**: пост-логин очередь заказов + expand hub (reuse tray) + workflow chips. Взять полезное из макета; оболочку/антипаттерны макета — нет.

## Очередь TZ

| # | TZ | SIZE | Depends |
|---|-----|------|---------|
| 1 | `TZ-NX-HOME-ROUTE-SHELL.md` | L | — |
| 2 | `TZ-NX-HOME-HUB-QUEUE.md` | L | 1 |
| 3 | `TZ-NX-HOME-WORKFLOW-CHIPS.md` | S | 2 |

Промпт: `tasks/_ready/2026-09-15-nx-home/PROMPT-CLAUDE-NX-HOME.md`

## Запреты волны

- Не портировать React/Vite макет.
- Не variant switcher / DESK-401 split demo / arch modals.
- Не mock Write-CTA (toast без API).
- Не трогать legacy `frontend/…/desk` delete.
- Не объявлять `/desk` без отдельной команды PO.
