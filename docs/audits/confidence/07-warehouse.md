# LEDGER-07 — Warehouse SoT
date: 2026-08-16T16:50:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 86
subscores:
  evidence_quality: 92
  sync_code_docs: 88
  risk_holes: 78

## What I opened (paths)
- docs/COUPLING-MAP.md §3 — «остаток qty: SoT = StorageItem. Не Material.stockQty»
- docs/FEATURE-INTEGRATION-CHECKLIST.md §D — «Склад: SoT qty = StorageItem / movements; не возвращать остаток в Material.stockQty»
- docs/pages/storage-items.page.md — envelope {items,total}, фильтры, read-only
- frontend/src/app/pages/materials/materials.page.ts — колонка «Склад» (L899), expand «Цена и склад»/«Остаток» (L573–577), link «Склад →» (L581)
- frontend/src/app/pages/materials/material-form-dialog.component.ts — НЕТ поля stockQty («Остаток — в разделе „Склад"»)
- backend/src/modules/material/material.schema.ts (L69 stockQty?) + dto
- backend grep: stockQty пишется только product.service.ts:172 (default 0 на create) и registry.service.ts (legacy metadata); stock-movement/storage-item/inventory НЕ обновляют Material.stockQty
- backend/src/modules/storage-item/storage-item.schema.ts — productId XOR materialId + unique (warehouse, ref, zone)

## PASS evidence
- **SoT остатка = StorageItem:** канон (COUPLING-MAP §3, FIC §D), storage-items.page.md (envelope, фильтры по складу/материалу, read-only) и schema (StorageItem: warehouse+zone+productId|materialId+unique индексы) согласованы. /storage-items читает StorageItem.
- **Material.stockQty не обновляется движениями:** grep по backend (stock-movement/storage-item/inventory/…) — ноль апдейтов; поле статическое (create-DTO/schema; product default 0). Форма материала его больше не редактирует.
- **Escape-hatch есть:** на карточке материала «Склад →» ведёт на /storage-items?materialId= — авторитетный остаток достижим.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P2 | materials.page.ts | Колонка «Склад» (key stockQty) и блок «Цена и склад» → «Остаток: {{ row.stockQty }}» рендерят `Material.stockQty` — legacy-поле, которое НЕ поддерживается движениями (grep: ноль апдейтов в warehouse-модулях) и не редактируется формой. Пользователь видит число, которое может расходиться с реальным StorageItem-остатком → «выдаёт за правду» (нарушение FIC §D / COUPLING-MAP §3) | TZ (убрать колонку/блок ИЛИ агрегировать из StorageItem per material) |
| F-02 | P3 | registry | registry.service.ts выставляет `stockQty: 'Остаток на складе'` как метаданные legacy-поля | с F-01 (если убираем колонку — почистить registry) |

## TZ drafted (if any)
- tasks/_backlog/TZ-OPS-316-materials-stock-display.md (F-01)

## Confidence note for Cursor
- Канон SoT чистый и задокументирован; единственное пятно — витрина materials.page.ts со stale stockQty (P2, UX-данные, не коррупция).
- Не проверял: агрегаты StorageItem по материалам на реальных данных (нужна Mongo); /stock-movements page.
- F-01 — кандидат на быструю починку: удалить колонку/блок или подтянуть сумму из /storage-items?materialId=.
