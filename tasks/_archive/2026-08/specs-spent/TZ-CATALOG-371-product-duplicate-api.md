# TZ-CATALOG-371: Безопасная копия изделия

РОЛЬ АГЕНТА: Senior NestJS Catalog Engineer

ЗАВИСИМОСТИ: TZ-CATALOG-314 DONE

LAYER: 2

PAGES: /catalog/products ; /proposals/create
PAGE_DOCS: products.page.md ; proposals-create.page.md

CONFLICT KEYS: backend/src/modules/product/product.controller.ts ; backend/src/modules/product/product.service.ts ; backend/src/modules/product/product.service.spec.ts ; backend/src/modules/product/dto/duplicate-product.dto.ts ; backend/src/modules/product/dto/update-product.dto.ts ; frontend/src/app/shared/services/products.service.ts ; frontend/src/app/shared/services/products.service.spec.ts ; docs/pages/products.page.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `ProductSchema`; unique `(organizationId, sku)`; `ProductService.create/update/findById`; EAV service; composition schema; Photo refs.

1. `Product.copiedFromProductId` уже существует, но duplicate endpoint отсутствует.
2. Копирование строки КП сейчас оставляет тот же `productId` и не создаёт изделие.
3. SKU обязателен и unique внутри organization scope.
4. Копия нужна не только КП: это самостоятельная catalog capability.

Канон: `docs/audits/2026-08-13-kp-photo-row-edit-copy-canon.md`.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Контракт

Добавить owner-scoped endpoint:

`POST /api/products/:id/duplicate`

Optional overrides разрешены только для:

- `name`;
- `description`;
- `unit`;
- `sku` (если пользователь явно указал свободный);
- остальных паспортных полей, уже разрешённых CreateProductDto, если это нужно caller TZ-SALES-372.

Не принимать `_id`, organizationId, stockQty, deletedAt, isSystem, audit/timestamps и raw attributes ids.

### ШАГ 2. Серверная копия

1. Загрузить source в organization scope; archived/deleted → 404.
2. Скопировать паспортные поля, category, description, prices, dimensions, composition, module refs, photo refs и EAV values.
3. `copiedFromProductId=source._id`.
4. `stockQty=0`; `status='draft'`/`new`; `isActive=true`; системные признаки не наследовать.
5. Копирование Photo означает ссылки на существующие assets, не дублирование бинарных файлов.

### ШАГ 3. Имя и unique SKU

1. Default name: `<имя> — копия`; повторная копия получает понятный следующий suffix без `копия копия`.
2. Default SKU: `<SOURCE-SKU>-COPY-1`, затем первый свободный integer в том же organization.
3. Collision-safe: unique index остаётся последней защитой; ограниченный retry при конкурентном создании.
4. Explicit занятой SKU → 409 с русским сообщением.

### ШАГ 4. Целостность и API client

1. Копия имеет независимые embedded composition arrays/EAV values; последующая правка не меняет source.
2. ObjectId refs category/modules/photos могут быть общими ссылками по существующему доменному контракту.
3. Добавить typed `ProductsService.duplicate(id, overrides?)`.
4. Audit action `duplicate`, source id + new id, без полного payload/PII.
5. Для будущего явного sync из КП добавить optional `expectedVersion` в Product update:
   - если передан, `findOneAndUpdate` включает `__v` в filter;
   - mismatch → 409 без изменения;
   - если не передан, существующие callers сохраняют текущий контракт.
6. Typed Product response содержит актуальный `__v`/`version`, достаточный для conflict-safe confirm в TZ-SALES-372.

## ИЗМЕНЯТЬ

Только conflict keys и прямые focused specs.

## НЕ ИЗМЕНЯТЬ

- UI редактора КП;
- складской остаток source;
- Photo binaries;
- source Product;
- auth/device flow, Desktop/MCP;
- migration/wipe/deploy.

## КРИТЕРИИ ПРИЁМКИ

1. Duplicate создаёт новый Product в той же organization с новым id/SKU и `copiedFromProductId`.
2. Source не мутируется.
3. Паспорт, composition, EAV и photo refs скопированы; stockQty/system/audit fields — нет.
4. SKU generation/collision/concurrent retry покрыты тестами.
5. Cross-organization/archived/deleted source не раскрывается.
6. Typed FE client готов для TZ-SALES-372.
7. Optional expectedVersion предотвращает stale overwrite и не ломает существующие callers.
8. Gates:
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- product.service --runInBand`
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - focused ProductsService Jest
   - `pnpm architecture:check`
   - `git diff --check`
9. Security/diff review PASS до archive.

## known_limitation

Endpoint не добавляет кнопку сам. Proposal rebind выполняет TZ-SALES-372.

## ФИНАЛИЗАЦИЯ

Root task: `GEMINI.md`, checklist, review PASS, archive/lock/progress/docs, commit+push. Deploy запрещён без команды PO.
