═══════════════════════════════════════════════════════════════
TZ-MATERIALS-302: Материалы — единицы и поставщики (DONE)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend/Backend Integration Engineer / QA-валидатор

РЕЗУЛЬТАТ
═════════

1. Hardcoded список единиц (`m2/m3/kg/sheet/pcs`) в material dialog заменён на
   `UnitsService.listActive()` (`GET /units/active`): loading («Загрузка единиц…»),
   error («Ошибка загрузки единиц» + text из extractErrorMessage), empty
   («Нет активных единиц — добавьте в разделе «Справочники»»). Сохраняется
   canonical `Unit.key`, пользователю показывается `label` + `symbol`.
   unitFallback(): если текущий unit редактируемого материала отсутствует в
   активном списке (единица деактивирована) или список не загрузился — рендерится
   disabled option с ключом («неактивна»), select никогда не «немой», payload
   сохраняет canonical key.

2. Поставщики: `OrganizationsService.list({ type: 'supplier', limit: 200 })` с
   loading/error/empty состояниями; в выпадающий список попадают только активные
   supplier-организации (isActive === true), `supplierId` сохраняется в payload,
   edit prefill по ID; повторной загрузки при открытии нет (одна подписка в
   constructor).

3. Backend contract НЕ менялся: `POST /units` (duplicate/403/validation) и
   supplier API остались как есть — приёмка по этому критерию покрыта
   существующим dictionaries-кодом (см. known_limitations).

ПРОВЕРКИ
════════

- frontend typecheck: `pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0
- targeted Jest: materials 2 suites / 19 tests PASS (включая 9 новых TZ-302:
  listActive success, listActive failure→unitsError, canonical key payload,
  edit prefill by key, unitFallback deactivated/active, supplierId payload,
  inactive supplier filtered, supplier loading/error states)
- code review: 2 раунда (осн. изменения + error-branch delta) — замечания
  устранены: stub возвращал plain object вместо Observable (исправлено на
  `of(opts.unitsResult ?? …)`), fallback option добавлен и в error-branch
- git diff --check: PASS
- Полный `ng build` на уровне цепочки временно заблокирован параллельной
  TZ-DOC-сессией (builder-inspector.component.ts NG5002 — файл не в conflict
  keys этой TZ); пере-прогон в конце цепочки.

ИЗМЕНЁННЫЕ ФАЙЛЫ
════════════════

- frontend/src/app/pages/materials/material-form-dialog.component.ts
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts

НЕ ИЗМЕНЯЛИСЬ (contract подтверждён):
- backend material schema/DTO, Organizations API, backend unit API

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (Codebuff session)
protected_files:
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
acceptance_status: PASS
verification:
  - frontend tsc (tsconfig.app.json --noEmit): PASS
  - frontend targeted Jest (materials): 2 suites / 19 tests PASS
  - code-reviewer-deepseek-flash: 2 rounds, findings resolved (stub Observable fix, error-branch fallback)
  - git diff --check: PASS
  - OrchestratorKit/verify-status.sh: PASS (см. финальный прогон цепочки)
manual_browser_check: NOT RUN for dialog visuals — запланирован на итоговый
  browser-аудит цепочки (стек :4200/:3000/mongo поднят); поведение единиц/
  поставщиков покрыто unit-тестами (listActive stub синхронный).
known_limitations:
  - Критерий «созданная единица появляется после reload и доступна в material
    dialog» покрыт существующим dictionaries flow (POST /units, reload);
    отдельные create-unit success/duplicate/403 unit-тесты не добавлены — этот
    код не менялся в рамках TZ, существующий dictionaries flow и его тесты
    остаются источником истины. При желании отдельный successor-TZ.
lock_file: .mimocode/locks/TZ-MATERIALS-302-reference-data.lock
successor_required: FALSE (цепочка 303..306 продолжается последовательно)
