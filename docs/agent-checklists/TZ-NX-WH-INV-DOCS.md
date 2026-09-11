# TZ-NX-WH-INV-DOCS checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-WH-INV-DOCS.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T08:44:56Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] Audit + WAVE прочитаны; `docs/pages/{storage-items,stock-movements,warehouses}.page.md`, `docs/CONTEXT.md` (существующая строка StorageItem/stockQty) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WH-INV-DOCS.md` на месте

## Acceptance

- [x] Docs отражают qty-only + entity matrix (метиз/деталь/сырьё → Material; ГП → Product; модуль не складируется)
- [x] Нет product diff (docs-only, подтверждено — ни один файл вне `docs/` не тронут)

## Integrity slot (до READY / archive)

- [x] Тип изменения: docs-only
- [x] FIC: N/A (docs-only, по TZ)
- [x] page.md обновлён: `storage-items.page.md` (новая секция «Inventory count → opening balance»), `stock-movements.page.md` (короткая ссылка + напоминание batch ≠ второй write-path)
- [x] DOMAIN-MAP / SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- Docs-only — FIC G N/A по TZ. Проверил diff вручную (Markdown-таблицы валидны, ссылки на существующие файлы).

## Executor report

- `docs/CONTEXT.md`: расширил существующую строку `StorageItem`/`stockQty` (теперь явно deprecated для обоих `Material.stockQty` **и** `Product.stockQty`) + новая строка «Занос инвентаризации / opening balance → `StockMovement in`/`adjust`, никогда голый create».
- `docs/pages/storage-items.page.md`: новая секция «Inventory count → opening balance» — entity-матрица (метиз/деталь/сырьё/ГП/модуль) + явный qty-only канон + напоминание, что будущий batch Excel (WAVE 02/03) — не второй write-path.
- `docs/pages/stock-movements.page.md`: короткая параллельная секция, ссылается на матрицу выше вместо дублирования.
- `docs/audits/2026-09-11-warehouse-inventory-import-readiness.md`: §8 closeout 01/3.
- WAVE row 01 → DONE.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T08:50:00Z
