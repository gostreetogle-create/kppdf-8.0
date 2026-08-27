# TZ-QA-445G — DONE

ARCHIVE_MARKER

> Статус: DONE · Закрыт: 2026-08-27 · agent: freebuff-1
> TZ: `tasks/TZ-QA-445G-desktop-import-supply-category.md`

## Что сделано

1. Категория **«Снабжение»** (`supply`) в Form Studio (`FORM_CATEGORIES`).
2. Таблицы: **Быстрый заказ** (`supplyRequest` → `POST /api/supply-requests`) и
   **Задачи снабжения** (`supplyTask` → `POST /api/supply-tasks`).
3. Скачивание формы + fingerprint `_kppdf` + identity mapping + валидация строк
   + прямой createEntities (как справочники), без MCP-зоны 445H.

## Gates (факт)

- `cd desktop && pnpm exec tsc --noEmit` → **PASS**
- `pnpm exec tsx --test src/core/excel-form-template.test.ts src/core/multi-import.test.ts src/importers/excel.test.ts` → **35/35 PASS**

## Conflict disclosure

- Keys: `desktop/src/**` (Import Form Studio)
- Not touched: MCP package (445H), product-detail, inventory, doc-constructor, desk

## Files

- `desktop/src/core/import-targets.ts`
- `desktop/src/core/excel-form-template.ts`
- `desktop/src/core/excel-form-template.test.ts`
- `desktop/src/core/multi-import.ts`
- `desktop/src/core/multi-import.test.ts`
- `desktop/src/App.svelte`
- `desktop/docs/MCP.md`
- `docs/agent-checklists/TZ-QA-445G.md`
- `.mimocode/locks/TZ-QA-445G-desktop-import-supply-category.lock`

## Deploy

NO

## Commit

`1bb3ac3cd2b74813ca2c9aa8a9320bf22ab776f7`
