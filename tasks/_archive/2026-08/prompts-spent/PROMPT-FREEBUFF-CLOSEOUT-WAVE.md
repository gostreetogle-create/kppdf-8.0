# Closeout wave — PO away (2026-08-23)

> **DONE на main:** KP 401–409 · DEN-552 · DESK 425–430 · SHIP-433  
> **WIP локально:** KP-410 (хвост) · Gantt 354 · deals chip · docs  
> **Deploy:** INVALID → после closeout Cursor «подготовь к деплою»

## Параллель (2 Freebuff, keys не пересекаются)

| Агент | Промпт | TZ | Keys |
|-------|--------|-----|------|
| **Freebuff-1** | [`PROMPT-FREEBUFF-KP-EXECUTOR-1.md`](./PROMPT-FREEBUFF-KP-EXECUTOR-1.md) | **410** → smoke → hygiene | `proposals/workspace/**`, `deals-group-chips*` |
| **Freebuff-2** | [`PROMPT-FREEBUFF-KP-EXECUTOR-2.md`](./PROMPT-FREEBUFF-KP-EXECUTOR-2.md) | **354** → density guards grep | `production/blocks/gantt-bars*` |

**Cursor (этот чат):** [`PROMPT-CURSOR-CLOSEOUT-ORCHESTRATOR.md`](./PROMPT-CURSOR-CLOSEOUT-ORCHESTRATOR.md) — deploy-prep после push обоих.

## PO вернётся — что проверить

1. `/proposals/workspace?new=1` — лист A4 + панель шаблона, не серая пустота
2. `/production` — длинное имя в Gantt: hover/peek badge
3. Сделки → chip «Коммерческое предложение» → workspace
4. 5-route таблица [`UI-DENSITY-GUARDS.md`](../docs/agent-checklists/UI-DENSITY-GUARDS.md)
5. «кати» только после DEPLOY-READY = READY

## Запреты всем

Deploy / wipe / «кати» без русской фразы PO.
