═══════════════════════════════════════════════════════════════
TZ-CATALOG-304: Legacy migration → composition (единственный write)
═══════════════════════════════════════════════════════════════

> Канон: `tasks/TZ-CATALOG-300.md` §4.1 write-source.  
> Тяжесть: **тяжёлая** · Риск: **критический** ·  
> Код: другой ИИ → **Cursor review + dry-run evidence ОБЯЗАТЕЛЬНЫ**.  
> Параллель: **нет**. После 303 DONE.

РОЛЬ АГЕНТА: Backend Developer (миграции / данные)

ЗАВИСИМОСТИ: TZ-CATALOG-302, TZ-CATALOG-303 DONE  
LAYER: 4

CONFLICT KEYS:
  backend/src/database/migrations/2026-08-04-TZ-CATALOG-304-composition-migrate.ts ;
  backend/src/modules/product/product.service.ts ;
  backend/src/modules/product-module/product-module.service.ts ;
  backend/test/e2e/products-attach-modules.e2e-spec.ts ;
  backend/test/e2e/product-modules.e2e-spec.ts ;
  backend/test/e2e/cost-calculation.e2e-spec.ts

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Dry-run режим миграции (лог без записи):
  - для каждого ProductModule.materials[] → composition lines
    lineType=material, refId=materialId, quantity, unit, isPurchased,
    overrideDimensions, sortOrder; сгенерировать _id.
  - для каждого Product.productModuleIds[] → composition lines
    lineType=module, refId=moduleId, quantity=1, sortOrder=index.
  - если composition уже непустой — **не дублировать** (idempotent skip
    или merge по (lineType,refId) — выбрать skip-if-nonempty проще и
    безопаснее; задокументировать).

ШАГ 2: Apply (idempotent): записать composition; legacy поля **оставить**
  для dual-read до отдельного cleanup successor.

ШАГ 3: После успешной миграции в runtime:
  - composition endpoints = единственный write для состава;
  - attachModule / запись в materials[] / productModuleIds → **410 или 400**
    «use composition API» (или redirect internal to composition — выбрать
    одно; предпочтение: писать через composition helper, legacy sync
    optional read-only).
  - Запрет dual-write расхождения: не писать в оба независимо.

ШАГ 4: Cost-calculation: dual-read composition || materials[] чтобы
  не сломать e2e (полная переписка cost — successor).

ШАГ 5: Evidence для Cursor:
  - счётчики dry-run (N modules, M products, lines created);
  - повторный apply → 0 changes;
  - sample до/после одного модуля.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Dry-run и apply идемпотентны.
2. Существующие связи модулей/материалов видны в composition GET.
3. Новая запись состава только через composition API.
4. attach-modules / cost e2e зелёные (или обновлены осознанно).
5. tsc PASS.
6. Cursor Architect verdict + PO OK перед DONE.
7. **HARD GATE:** prod-apply миграции только после **TZ-CATALOG-317** PASS
   (FE cutover) *или* явного временного redirect attach→composition в
   Executor report 304 + согласование PO. Иначе UI товаров/модулей ляжет.

НЕ: удалять legacy колонки из schema в этом TZ (successor);
  lineType=product (305); Excel; hard-delete Module (→ TZ-CATALOG-314);
  UI composition tree (→ 311).
  FE cutover целиком — **317**, не этот файл.
═══════════════════════════════════════════════════════════════
ПРОМПТ ИСПОЛНИТЕЛЮ
═══════════════════════════════════════════════════════════════

```text
GEMINI.md + TZ-CATALOG-300 + TZ-CATALOG-304.md.
Миграция осторожно: dry-run evidence обязателен в Executor report.
Не удаляй legacy fields из schema. Не 305. После — «Cursor, проверь 304».
```
