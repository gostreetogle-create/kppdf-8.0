# LEDGER-04 — Catalog FE↔BE
date: 2026-08-16T16:05:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 89
subscores:
  evidence_quality: 94
  sync_code_docs: 90
  risk_holes: 82

## What I opened (paths)
- frontend/src/app/shared/services/materials.service.ts — Material interface, list/create/update (silent-http)
- frontend/src/app/shared/services/products.service.ts — Product interface, list/create/update
- frontend/src/app/shared/services/pi-product-modules.service.ts — ProductModule + composition CRUD
- frontend/src/app/pages/materials/material-form-dialog.component.ts — Save payload (onSubmit L~850)
- frontend/src/app/pages/products/product-form-dialog.component.ts — Save payload (L876–910)
- backend/src/modules/material/material.controller.ts + dto/create-material.dto.ts, update-material.dto.ts
- backend/src/modules/product/product.controller.ts + dto/create-product.dto.ts
- backend/src/modules/product-module/product-module.controller.ts + dto/create-product-module.dto.ts
- backend/src/common/guards/roles.guard.ts — RolesGuard семантика
- backend/src/common/seed/admin.seed.ts — DIRECTOR_PAGES (из LEDGER-03)

## PASS evidence
- **_id vs id:** FE типы и все update-пути используют `_id` (Material._id, Product._id, ProductModule._id, Photo._id); backend отдаёт mongoose-доки с `_id`; диалоги шлют `update(data._id, payload)` / `update(editId, payload)` — расхождений `id` в выборке нет.
- **Обязательный артикул:** material.article required BE (RU «Артикул материала обязателен», 1–64) = FE required validator; product.sku required BE (RU «Артикул изделия обязателен») = FE always sends `sku`; module.article required BE (RU «Артикул модуля обязателен», 1–64) = FE ProductModuleUpsertDto.article required. Тройка консистентна.
- **RU errors:** class-validator сообщения в DTO на русском (product: «Недопустимый тип изделия», «Длина должна быть числом», «Цена не может быть отрицательной»; material: «Артикул материала обязателен»; module: «Артикул модуля обязателен»); FE `extractErrorMessage` их показывает.
- **Payload ↔ DTO:** material-form payload (name/article/unit/sku/materialKind/weightKg/assortment/standardRef/materialGrade/pricePerUnit/supplierId/dimensions/description/notes/photoIds/mainPhotoId) ⊆ CreateMaterialDto; `''`-sentinel для materialKind корректно опускается, сервер backfills `other` (TZ-CATALOG-301). product-form payload (name/kind/unit/status/isActive/sku/…/ralCode/categoryId) ⊆ CreateProductDto; ralCode/categoryId явно шлют `null` для очистки (BE emptyStringToNull + IsOptional) — верно.
- **Duplicate/legacy:** composition CRUD каноничен; `attachToProduct/detachFromProduct` — throwing stub (TZ-CATALOG-317) — legacy write-path не тихий.
- **Gate:** jest material-form-dialog + product-form-dialog → 72/72 PASS.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P2 | RBAC seed vs controllers | Директор имеет в DIRECTOR_PAGES: materials, organizations, counterparties, import-todos, categories, doc-template-categories, text-block-categories — nav их показывает, но `GET` списки этих модулей = `@Roles('admin','manager')` (material.controller:15, counterparty:26, organization:35, import-todo:43, category:15, doc-template-category:38, text-block-category:39) → директор получает 403. Соседние products/modules/work-types включают 'director' — непоследовательно | TZ (решение RBAC: добавить 'director' к спискам ИЛИ убрать страницы из DIRECTOR_PAGES; FIC §B) |
| F-02 | P3 | контракт списков | products/materials = envelope `{items,total,page,limit}`; modules = плоский массив `ProductModule[]` (клиентская пагинация). Разные контракты в одном каталоге | accept / TZ-документировать (не ломает) |
| F-03 | P3 | material read roles | GET /materials закрыт admin/manager, а GET /materials/:id и :id/where-used открыты 'user' — «список закрыт, чтение открыто» | accept (вероятно намеренно для форм), подтвердить PO |

## TZ drafted (if any)
- tasks/_backlog/TZ-OPS-314-director-catalog-403.md (F-01)

## Confidence note for Cursor
- Поля create/update трёх сущностей каталога совпадают FE↔BE построчно; спеки форм зелёные.
- F-01 — самый весомый риск волны: живого director-аккаунта я не проверял (не доказано 403 runtime), только статика RolesGuard + seed.
- F-02/F-03 — косметика контракта; не security.
