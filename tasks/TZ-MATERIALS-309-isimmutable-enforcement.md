═══════════════════════════════════════════════════════════════
TZ-MATERIALS-309: Габариты — серверное enforcement isImmutable (Layer 4)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer / Domain Integration QA

ЗАВИСИМОСТИ: TZ-MATERIALS-305 (audit — выполнено). Данный TZ — Layer 4
successor по правилу TZ-305: «если backend этого не умеет, оформить отдельный
successor вместо ложного UI-only исправления».

LAYER: 4 (backend contract enforcement)

CONFLICT KEYS:
backend/src/modules/product-module/product-module.schema.ts;backend/src/modules/product-module/product-module.service.ts;backend/src/modules/product-module/dto/*;frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;frontend/src/app/shared/services/pi-product-modules.service.ts;backend/src/modules/material/material.schema.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (audit TZ-305)
═══════════════════════════════════════════════════════════════

1. `Material.dimensions[].isImmutable` существует в material schema/DTO и
   сохраняется из формы (checkbox «Неизменяемый»).

2. ProductModule имеет `materials[].overrideDimensions {length,width,height,unit}`
   (module UI: ModuleMaterialsFormDialog). Backend `product-module.service`
   (create/update) принимает `overrideDimensions` БЕЗУСЛОВНО — проверки
   «нельзя override immutable dimension» НЕТ. Module UI показывает override
   поля всегда, без учёта isImmutable материала.

3. Вывод: защита `isImmutable` сегодня — только checkbox в material dialog;
   module override flow не учитывает её ни на UI, ни на backend boundary.
   Это подтверждённый enforcement-gap (не обещаем защиту только на UI).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (scope предложен; уточнить доменный контракт с PO)
═══════════════════════════════════════════════════════════════

ШАГ 1: Зафиксировать доменное правило: dimension `isImmutable=true` в material
не может быть переопределён в module override (length/width/height). Если
материал не имеет immutable длины — override разрешён.

ШАГ 2: Backend enforcement в `ProductModuleService.create/update`:
- при наличии `materials[].overrideDimensions.length/width/height` — загрузить
  material по materialId, найти его dimensions с type=length/width/height и
  isImmutable=true; если immutable и override задан (не null/undefined) —
  BadRequestException/ConflictException с понятным сообщением;
- либо, по решению PO, принудительно сбрасывать override для immutable
  (вариант soft) — зафиксировать choice.

ШАГ 3: Frontend (module-materials-form-dialog): когда у материала есть
immutable dimension — disabled/hidden соответствующие override-поля с
пояснением; подтягивать material.dimensions в строку модуля (или через
lookup в service).

ШАГ 4: Tests:
- backend: create/update module с override immutable length → 400/409;
  override не-immutable → ок; material без immutable → ок;
- frontend: override-поле disabled при immutable, enabled иначе;
- регрессия material dialog isImmutable payload.

КРИТЕРИИ ПРИЁМКИ
════════════════
1. Immutable dimension не переопределяется ни на UI, ни на backend boundary.
2. Existing product-module records не ломаются (без миграций).
3. Backend typecheck/build + Jest; frontend typecheck/Jest; diff --check; verify-status PASS.

ОГРАНИЧЕНИЯ: не вводить миграции данных; не менять material dimension
contract; не блокировать override для не-immutable размеров.
