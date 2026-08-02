═══════════════════════════════════════════════════════════════
TZ-MATERIALS-305: Материалы — габариты и неизменяемость
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / Domain Integration QA

ЗАВИСИМОСТИ: TZ-MATERIALS-301; выполнить до итогового browser-аудита материалов.

LAYER: 3 (backend contract change — отдельный successor Layer 4 при доказанной необходимости)

CONFLICT KEYS:
frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;frontend/src/app/shared/services/pi-product-modules.service.ts;backend/src/modules/material/material.schema.ts;backend/src/modules/product-module/product-module.schema.ts;backend/src/modules/product-module/product-module.service.ts;relevant specs

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `addDimension()` всегда добавляет строку типа `length` со значением 0. Пользователь наблюдал, что один клик иногда создаёт две строки, а повторные строки снова имеют длинное «по умолчанию».

2. Material dimension types уже определены: length, width, height, thickness, diameter, depth. Нужно сделать предсказуемый порядок типов и один add-event → одна row.

3. `isImmutable` хранится в Material dimension DTO/schema. ProductModule имеет material references и overrideDimensions; нужно проверить, действительно ли module UI/API запрещает override immutable dimensions, а не только показывает checkbox.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Воспроизвести один click по `data-test="add-dimension"` и проверить event propagation/form submit/Angular change detection. Зафиксировать фактическое количество rows и payload.

ШАГ 2: Исправить добавление так, чтобы один пользовательский click добавлял ровно одну строку; default type выбирался первым ещё не использованным типом в порядке Длина → Ширина → Высота → Толщина → Диаметр → Глубина. Если все типы уже есть, использовать явно документированное повторное поведение.

ШАГ 3: Сохранить value и unit semantics без скрытого преобразования; добавить понятные русские labels, компактную строку и отдельную кнопку удаления. Не менять dimension type contract без необходимости.

ШАГ 4: Проследить `isImmutable` через module attach/edit/override API. Если dimension immutable, module UI должен disable/hide corresponding override and backend должен enforce rule; если backend этого не умеет, оформить отдельный successor вместо ложного UI-only исправления.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/materials/material-form-dialog.component.ts;
- frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;
- frontend/src/app/shared/services/pi-product-modules.service.ts — только payload mapping;
- backend product-module/material contract — только если enforcement подтверждён необходимым;
- relevant specs.

НЕ ИЗМЕНЯТЬ:
- unrelated FormArray dialogs;
- dimensions of products/modules without contract review;
- database migrations.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Один click по «Добавить размер» создаёт ровно одну FormArray row и один соответствующий payload item.
2. Новые строки получают следующий неиспользованный тип; existing edit rows не дублируются.
3. Удаление, reorder/редактирование типа и сохранение работают без потери значений.
4. `isImmutable=true` реально учитывается в module override flow: запрещённый override не проходит ни UI, ни backend boundary; либо limitation вынесено в successor TZ.
5. Tests покрывают one-click, defaults, duplicate types, remove, immutable allow/deny.
6. Frontend/backend typecheck, development build и relevant Jest проходят.
7. Browser-check подтверждает размеры text/material/module сценария.

РУЧНОЙ СЦЕНАРИЙ: нажать «Добавить размер» один раз несколько раз; проверить Длина/Ширина/Высота; сохранить; подключить материал к модулю; попробовать изменить неизменяемый и изменяемый размер.

ОГРАНИЧЕНИЯ: не обещать защиту `isImmutable` только на основании disabled checkbox.
