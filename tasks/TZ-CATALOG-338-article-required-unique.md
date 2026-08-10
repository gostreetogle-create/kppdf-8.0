═══════════════════════════════════════════════════════════════
TZ-CATALOG-338: Артикул required+unique; название изделия optional
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Full-stack (BE schema/DTO + FE forms/QuickCreate/profiles)
ЗАВИСИМОСТИ: Нет (после 317–318 предпочтительно; keys разные)
LAYER: 3 (строго 1 агент — много form)
CONFLICT KEYS: backend/src/modules/product/product.schema.ts; backend/src/modules/product/dto/create-product.dto.ts; backend/src/modules/product/product.service.ts; backend/src/modules/product-module/product-module.schema.ts; backend/src/modules/product-module/dto; backend/src/modules/material/material.schema.ts; backend/src/modules/material/dto/create-material.dto.ts; backend/src/modules/material/material.service.ts; backend/src/modules/form-profiles/form-profile.constants.ts; frontend/src/app/pages/products/product-form-dialog.component.ts; frontend/src/app/pages/modules/module-form-dialog.component.ts; frontend/src/app/pages/materials/material-form-dialog.component.ts; frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts; docs/agent-checklists/TZ-CATALOG-338.md

PAGES: /products ; /modules ; /materials ; /dictionaries/form-profiles
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md ; form-profiles.page.md

Проверено: Product.name required / sku optional sparse-unique; Module.article optional; Material.article optional (sku auto via category); form-profiles LockedRequired includes name for product.

Dictation → код:
- «Артикул изделия» = `Product.sku`
- «Артикул модуля/материала» = `article`
- «Документы» = те же артикулы каталога (не отдельная doc-article entity)

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Backend validation + uniqueness
  - Product: `sku` **required** (trim non-empty); keep unique index (убрать pure-sparse optional behavior для новых — migration/guard: reject empty).
  - Product: `name` **optional**; list/detail display fallback = sku если name пуст.
  - Module: `article` required + unique index `{ organizationId, article }` sparse-safe for legacy empties OR backfill note in known_limitation.
  - Material: `article` required + unique `{ organizationId, article }`; internal `sku` auto — без изменения MATERIALS-307.
  - Duplicate → 409/400 с RU сообщением «Артикул уже используется».

ШАГ 2: Frontend forms + QuickCreate
  - Product form/QC: Validators.required на sku; name без required.
  - Module/Material: article required.
  - Labels RU: «Артикул» (не оставлять только SKU без пояснения).

ШАГ 3: Form profiles
  - LockedRequired: product → `sku` (+ kind/unit as today); **убрать name из locked required** если там есть; name остаётся в visible optional.
  - Module/material: `article` in LockedRequired.
  - Не ломать seed idempotency tests — обновить constants + specs.

ШАГ 4: Tests
  - BE: create without article/sku fails; duplicate fails.
  - FE: form invalid without article/sku; name empty allowed for product.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Cross-entity unique (product.sku vs material.article) — **не** требовать
- KP/table-template column keys (уже unique keys)
- Desktop import HITL bulk (successor если нужно)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Нельзя сохранить изделие без артикула; можно без названия.
2. Нельзя сохранить модуль/материал без артикула.
3. Дубликат артикула в той же сущности/org → ошибка пользователю.
4. Form profiles: нельзя снять галочку с артикула (locked).
5. Gates: BE tsc + targeted jest; FE tsc + quick-create/form-profiles jest; archive + report.

known_limitation: legacy rows with empty article — document migration/backfill or soft reject on edit only; SUPPLY titles out of scope.
