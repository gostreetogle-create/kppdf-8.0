═══════════════════════════════════════════════════════════════
TZ-MATERIALS-305: Материалы — габариты и неизменяемость (DONE)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / Domain Integration QA

РЕЗУЛЬТАТ
═════════

1. Один click по «Добавить размер» (app-pi-button `click` Output, эмитит
   ровно один раз — двойного fire нет) создаёт ровно одну FormArray row.
   `addDimension()` теперь выбирает следующий неиспользованный тип в канон.
   порядке Длина → Ширина → Высота → Толщина → Диаметр → Глубина
   (`nextUnusedDimensionType()`). Когда все шесть типов заняты — fallback на
   'length' (явно документированное повторное поведение в JSDoc).

2. Existing edit rows не дублируются: patchFromData (синхронный, в
   constructor) кладёт существующие dimensions, addDimension не трогает их и
   выбирает следующий свободный тип.

3. Удаление (`removeDimension(i)`), выбор типа, value/unit semantics без
   скрытых преобразований, русские labels (Длина/Ширина/...) и кнопка
   удаления — сохранены (шаблон из TZ-301, компактная grid-строка).

4. isImmutable audit (ШАГ 4): подтверждён enforcement-gap — backend
   `ProductModuleService.create/update` принимает `materials[].overrideDimensions`
   БЕЗУСЛОВНО (проверки immutable нет), module UI (ModuleMaterialsFormDialog)
   показывает override поля без учёта isImmutable материала. Защита сегодня —
   только checkbox в material dialog. По правилу TZ-305 (не обещать защиту
   только на UI; backend не умеет → successor) оформлен Layer 4 successor:
   tasks/TZ-MATERIALS-309-isimmutable-enforcement.md (backend rule + UI disable,
   с вариантами hard/soft и уточнением доменного контракта у PO).

ПРОВЕРКИ
════════

- frontend tsc (tsconfig.app.json --noEmit): PASS (0 errors; исключены
  параллельные TZ-DOC-файлы, не в conflict keys этой TZ)
- frontend jest materials: 2 suites / 32 tests PASS (включая 6 новых TZ-305:
  one-click-one-row, канон. порядок типов, edit rows не дублируются,
  removeDimension, all-six fallback на 'length', isImmutable в payload)
- code-reviewer-deepseek-flash: 3 раунда — findings устранены (добавлен тест
  на fallback при всех шести типах; остальное подтверждено: типизация
  DimensionFormGroup, payload shape, отсутствие double-fire)
- git diff --check: PASS (только LF/CRLF warnings)
- Полный `ng build` — пере-прогон в конце цепочки (параллельная TZ-DOC-сессия
  чинит свои файлы).

ИЗМЕНЁННЫЕ ФАЙЛЫ
════════════════

- frontend/src/app/pages/materials/material-form-dialog.component.ts
  (addDimension → nextUnusedDimensionType, JSDoc)
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts (+6 тестов)
- tasks/TZ-MATERIALS-309-isimmutable-enforcement.md (NEW successor Layer 4)

НЕ ИЗМЕНЯЛИСЬ:
- backend material/product-module contract (enforcement вынесен в TZ-309),
  module-materials-form-dialog.component.ts (изменение — в TZ-309),
  dimension type contract, database.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (Codebuff session)
protected_files:
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
acceptance_status: PASS
verification:
  - frontend tsc --noEmit: PASS
  - frontend jest materials: 32/32 PASS
  - code review: 3 rounds, findings resolved
  - git diff --check: PASS
  - OrchestratorKit/verify-status.sh: PASS (прогон после closeout)
manual_browser_check: NOT RUN — one-click-one-row и порядок типов покрыты
  unit-тестами; визуальный прогон габаритов — на итоговый browser-аудит
  цепочки (стек :4200/:3000/mongo поднят).
known_limitations:
  - isImmutable НЕ enforce'ится в module override flow (ни UI, ни backend):
    подтверждённый gap вынесен в TZ-MATERIALS-309 (Layer 4), как требует
    правило TZ-305 (никаких ложных UI-only исправлений).
lock_file: .mimocode/locks/TZ-MATERIALS-305-dimensions-contract.lock
successor_required: TRUE → tasks/TZ-MATERIALS-309-isimmutable-enforcement.md
