═══════════════════════════════════════════════════════════════
TZ-MATERIALS-313: цена материала — число, не строка (POST 400)
═══════════════════════════════════════════════════════════════

PAGES: /materials
PAGE_DOCS: materials.page.md

РОЛЬ АГЕНТА: Frontend + Backend (узко DTO). Root TZ, GEMINI.md.

ЗАВИСИМОСТИ: Нет.

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/materials/material-form-dialog.component.ts; backend/src/modules/material/dto/create-material.dto.ts; frontend/src/app/pages/materials/material-form-dialog.component.spec.ts; backend/src/modules/material/material.service.spec.ts

Проверено: `app-pi-input` CVA всегда отдаёт **string** (`input.component.ts` onChange: string). Форма кладёт это в `pricePerUnit`. Submit: `payload.pricePerUnit = v.pricePerUnit` **без** `Number()`, тогда как `weightKg` уже `Number(v.weightKg)`. DTO `@IsNumber() @Min(0)` без `@Type(() => Number)`. ValidationPipe `transform: true` **без** `enableImplicitConversion`. Итог на проде: UI «500» → JSON `"500"` → 400 «must not be less than 0; must be a number…».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — FE payload
- В `onSubmit` для `pricePerUnit`: как `weightKg` — `Number(...)`.
- Пустая строка / null / NaN → **не класть** поле в payload (не слать `""`).
- Не менять UX полей, sku, фото, dimensions.

ШАГ 2 — BE DTO
- На `pricePerUnit` и `weightKg` в `CreateMaterialDto`: `@Type(() => Number)` перед `@IsNumber()`.
- Update DTO наследует PartialType — отдельно не дублировать, если Type уже на Create.

ШАГ 3 — тест
- FE spec: create payload с введённой ценой как string `"500"` → HTTP body `pricePerUnit === 500` (number).
- Или backend e2e/unit: POST `{ name, article, unit, pricePerUnit: "500" }` после transform принимается.
- Минимум один из двух. Предпочтительно FE spec на dialog submit (реальный баг).

ШАГ 4 — gates
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=material-form-dialog
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
```
Focused, не полный matrix.

НЕ ИЗМЕНЯТЬ: pi-input CVA глобально (не эта TZ); склад/stockQty UI; wipe; VPN; COMP-401.

KNOWN: деплой — отдельная команда PO; если PO уже на проде и чинит «сейчас» — parent задеплоит.

Финализация: archive 2026-08 + lock + Executor report (auto).

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Gemini
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
