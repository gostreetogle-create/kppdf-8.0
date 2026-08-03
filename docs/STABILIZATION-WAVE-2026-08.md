# Stabilization Wave — 2026-08

> Канон волны «полки + спокойная база». Источник плана PO.  
> **Код продукта** — только по executable TZ ниже. Z-002 / PRODUCTION / Gantt — PARKED.

**Победа:** `логин → Создать шаблон → билдер → блок → сохранить` без сюрпризов (ноут + приемлемо 375px на ключевых диалогах).

## Порядок исполнения

| # | ID | Статус старта | Файл |
|---|-----|---------------|------|
| 1 | DOC-337 | DONE | [`tasks/_archive/2026-08/TZ-DOC-337.done.md`](../tasks/_archive/2026-08/TZ-DOC-337.done.md) |
| 2 | DOC-338 | DONE | [`tasks/_archive/2026-08/TZ-DOC-338.done.md`](../tasks/_archive/2026-08/TZ-DOC-338.done.md) |
| 3 | DOC-339 | DONE | [`tasks/_archive/2026-08/TZ-DOC-339.done.md`](../tasks/_archive/2026-08/TZ-DOC-339.done.md) |
| 4 | DOC-340 | DONE | [`tasks/_archive/2026-08/TZ-DOC-340.done.md`](../tasks/_archive/2026-08/TZ-DOC-340.done.md) |
| 5 | DOC-341 | DONE | [`tasks/_archive/2026-08/TZ-DOC-341.done.md`](../tasks/_archive/2026-08/TZ-DOC-341.done.md) |
| 6 | UX-DIALOG-301 | DONE | [`tasks/_archive/2026-08/TZ-UX-DIALOG-301.done.md`](../tasks/_archive/2026-08/TZ-UX-DIALOG-301.done.md) |
| 7 | PROC-301 | DONE | [`tasks/_archive/2026-08/TZ-PROC-301.done.md`](../tasks/_archive/2026-08/TZ-PROC-301.done.md) |
| 8 | UX-306 | PARKED | [`tasks/_backlog/TZ-UX-306-people-route-align.md`](../tasks/_backlog/TZ-UX-306-people-route-align.md) — после 337–340 по слоту PO |

Индекс: [`tasks/README.md`](../tasks/README.md) · map: [`docs/agent-checklists/_active-map.md`](./agent-checklists/_active-map.md)  
Dialog canon: [`docs/DIALOG-COOKBOOK.md`](./DIALOG-COOKBOOK.md)

## Anti-goals

- Не оживлять dead DSL / Z-002
- Не parallel Layer-3 на `templates.page.ts` / `pi-dialog*`
- Не wipe Mongo без явного PO
- Не обещать «весь ERP готов»

## Уже починено (не reopen без доказательства)

Auth RoleModule · TextBlockCategoriesSeed `obshchee` · templates auto-org INN · ValidationPipe 400 · deploy cache canon

## Definition of Done волны

- [x] Create шаблона A3/A4/A5 → билдер (DTO + setup + templates create path)
- [x] Duplicate не врёт про category
- [x] 375px: setup + materials — `min(…, 100vw - 2rem)` на PiDialog / form dialogs
- [x] Smoke PROC-301 checklist в SESSION + RUNBOOK (исполнять после каждого деплоя)
- [x] Cookbook существует; Z-002 PARKED в z-series README

## Контракт ИИ с PO

1. Назвать пользовательский путь и красное на нём  
2. Канон сразу, не 2 недели экспериментов  
3. Вертикаль зелёная → потом фичи  
4. Конфликт идеи PO с каноном — сказать сразу
