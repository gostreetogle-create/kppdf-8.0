# Аудит QA 2026-09-06 — shell bleed + warehouse populate + data residue

> Источник: live browser QA (локальные Mongo + backend + NX). Код-фиксы уже в WIP;
> этот файл — triage Cursor Mode A (necessity filter `PO-SHARED` §2).

## Preflight Check Output

- **Context read:** `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `backend/src/database/soft-delete.plugin.ts`, diff четырёх WIP-файлов, `docs/pages/nx-shell.page.md`, `docs/pages/stock-movements.page.md`
- **Key Constraints:** Mode A (без product-патчей Cursor); wipe shared DB только по явной фразе PO (`GIT-POLICY`)
- **Planned Deliverable:** commit-TZ hotfix · page-doc notes · PARK data residue
- **Validation Path:** gates в TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE · FIC §A N/A (поведение list/populate, не route)

## Вердикт по пунктам отчёта

| Находка | Вердикт | Действие |
|---------|---------|----------|
| Логотип KPPDF обрезался (`pi-edge-bleed` на root shell/kit header без parent padding) | **Реальный баг** | WIP уже чинит; ship `TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE` |
| Журнал «Движения» / «Остатки» показывают «—» для soft-deleted каталога | **Реальный баг** (populate + soft-delete plugin) | WIP `includeSoftDeleted: true`; тот же TZ |
| Kit footer «Syne · Plus Jakarta Sans» | Мелочь / stale copy | В том же WIP |
| DocStudio «Данные» перекрывает A4 | **Не баг** — `PO-CANON` flyout overlay | Не трогать |
| 5 закупок → заказ 404 | Мусор shared seed | **CLEANED** — 5 orphan `supplytasks` удалены локально 2026-09-06; проверка после clean: 0 |
| 6/120 движений → товар hard-deleted | Ожидаемо после soft-delete fix | **CLEANED** — 6 orphan `stockmovements` удалены локально 2026-09-06; проверка после clean: 0 |
| ~14 картинок DocStudio 404 | Файлы сняты с диска | **CLEANED** — 7 broken refs сняты локально 2026-09-06; проверка после clean: 0 |

## Root cause (код)

1. **Shell:** `.pi-edge-bleed` = отрицательный margin под `--space-page-x` родителя. В `app-shell` / `kit-layout` header сидит в корне **без** этого padding → сдвиг влево и обрезка бренда. Bleed остаётся валиден для `pi-page-chrome` внутри padded frame.
2. **Склад:** `softDeletePlugin` на `find`/`findOne` режет `deletedAt: null` и внутри populate. Архив товара в каталоге молча пустил имена в журнале/остатках. Escape hatch плагина: `options.includeSoftDeleted: true`. Hard-delete документа populate не вернёт — «—» останется (6 строк в текущей dev DB; удалены cleanup B).

## Data residue closeout (TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN)

- **Scope:** только локальный Docker Mongo `kppdf-mongo` (`mongo:7`, `127.0.0.1:27017`) и локальный `backend/uploads`; без production/Synology, `dropDatabase`, deploy wipe, wholesale catalog cleanup или UI/layout изменений.
- **Before dry-run:** `5` supply orphans, `6` hard-missing stock movements, `7` broken Doc Studio image refs.
- **Apply:** deleted `5` `supplytasks`, deleted `6` `stockmovements`, removed `7` broken image references from `document_templates` / `template_blocks`; complete templates/documents were preserved.
- **Apply note:** the first apply left one same-document array entry because of the pre-batch implementation; a minimal script fix batched array indexes and the second apply removed the remaining `1` image ref. Effective total remains `7`.
- **After repeat dry-run:** `0` supply orphans, `0` hard-missing movements, `0` missing-file image refs.
- **Seed:** not run; retained demo collections were populated and no reseed was needed.
- **Verification:** `node --check scripts/clean-local-demo-orphans.mjs` and `git diff --check` PASS; direct local DB sanity counts preserved `orders=132`, `products=186`, `materials=138`, `document_templates=17`, `studio_documents=29`, `template_blocks=73`.

## Не invent

- Полный `dropDatabase` / Synology wipe — нет (только точечные orphans + при нужде `seed-local-demo`).
- Snapshot имени на `StockMovement` ради hard-deleted refs — не сейчас (строки удаляем).
- Править legacy `frontend/` kit Syne-тексты / `pi-edge-bleed` на `app-layout` — partial legacy cleanup, нет.
- Chrome IA / DocStudio visual smoke — не запускались в closeout B; UI/layout scope не расширялся.

## PO decision 2026-09-06

Локальные данные на этапе NX = виртуальные. Чистить битое аккуратно; вносить в контур только актуальное для показа. TZ: `tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`.

## Связанные артефакты

- TZ ship: `tasks/_ready/nx-warehouse/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md`
- Prompt: `tasks/PROMPT-FREEBUFF-HOTFIX-SHELL-WAREHOUSE.md`
- Cleanup checklist: `docs/agent-checklists/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`
