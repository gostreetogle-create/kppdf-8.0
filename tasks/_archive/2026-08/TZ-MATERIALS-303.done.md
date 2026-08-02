═══════════════════════════════════════════════════════════════
TZ-MATERIALS-303: Материалы — понятный код и идентификация (DONE)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Product Analyst / API Contract Engineer / Frontend Engineer

РЕЗУЛЬТАТ И РЕШЕНИЕ
════════════════════

Выбрано решение B (ручной optional input + русское объяснение) с Layer 4
successor на серверную генерацию. Основание: серверная генерация через counter
требует подключения CounterService+CategoryModel в MaterialService (как в
ProductService) — это backend counter/transaction change → по правилам TZ
отдельный successor, а не небезопасная локальная генерация на клиенте.

Найден и исправлен скрытый дефект: `sku` ОТСУТСТВОВАЛ в CreateMaterialDto/
UpdateMaterialDto, при этом backend main.ts использует
`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` — ручной ввод
SKU приводил к HTTP 400 (поле запрещено whitelist'ом). Поле теперь корректно
задекларировано (`@IsOptional @IsString @Length(0, 64)`), а не «обойдено».

СДЕЛАНО
═══════

1. Backend:
   - create-material.dto.ts: добавлен `sku` (IsOptional/IsString/Length 0..64);
     UpdateMaterialDto наследует через PartialType.
   - material.service.ts: `rethrowDuplicateSku()` — E11000 → ConflictException
     409 («Материал с таким внутренним кодом уже существует») в create и
     update (doc.save()); прочие ошибки пробрасываются как есть.
   - Уникальность остаётся серверной: Mongo `unique: true, sparse: true`.
2. Frontend:
   - dialog: label «Код (SKU)» → «Внутренний код материала», placeholder
     «Например, M-0001», hint «Необязательное поле. Уникальный системный код
     для поиска — заполняется вручную или будет генерироваться сервером
     автоматически» (без утечки внутренних id в UI).
   - materials.page.ts: колонка «Код» → «Внутренний код».
3. Docs: docs/data-model.md и docs/pages/materials.page.md — раздел
   «Артикул vs Внутренний код материала» (article — внешний/пользовательский,
   sku — уникальный системный идентификатор; кто создаёт, обязательность,
   редактируемость, 409 на коллизию).
4. Создан successor: tasks/TZ-MATERIALS-307-sku-autogeneration.md (Layer 4) —
   серверная генерация через CounterService.next('Material', cat.skuPrefix)
   с приоритетом ручного sku, по образцу ProductService.

ПРОВЕРКИ
════════

- backend tsc --noEmit: PASS (0 errors; фильтр исключает параллельные
  TZ-DOC-файлы builder-inspector/snap-engine — не в conflict keys этой TZ)
- frontend tsc (tsconfig.app.json --noEmit): PASS
- backend jest material.service.spec.ts: 1 suite / 5 tests PASS
  (sku через DTO, E11000→409 create, E11000→409 update, не-duplicate rethrow,
  404 без save)
- frontend jest materials: 2 suites / 23 tests PASS (включая 4 новых TZ-303:
  terminology через getAttribute, sku в payload, sku omitted когда пуст,
  edit prefill sku+article)
- code-reviewer-deepseek-flash: 3 раунда — findings устранены
  (properties[]→getAttribute для stubbed custom elements в jsdom; утечка
  TZ-id из UI-текста; mock-фикс findById().exec())
- git diff --check: PASS (только LF/CRLF warnings)
- Полный `ng build` на уровне цепочки временно заблокирован параллельной
  TZ-DOC-сессией; пере-прогон в конце цепочки.

ИЗМЕНЁННЫЕ ФАЙЛЫ
════════════════

- backend/src/modules/material/dto/create-material.dto.ts
- backend/src/modules/material/material.service.ts
- backend/src/modules/material/material.service.spec.ts (NEW, 5 тестов)
- frontend/src/app/pages/materials/material-form-dialog.component.ts
- frontend/src/app/pages/materials/materials.page.ts
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts (+4 теста)
- docs/data-model.md
- docs/pages/materials.page.md
- tasks/TZ-MATERIALS-307-sku-autogeneration.md (NEW successor)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (Codebuff session)
protected_files:
  - backend/src/modules/material/dto/create-material.dto.ts
  - backend/src/modules/material/material.service.ts
  - backend/src/modules/material/material.service.spec.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
acceptance_status: PASS
verification:
  - backend tsc --noEmit: PASS
  - frontend tsc --noEmit: PASS
  - backend jest material.service.spec.ts: 5/5 PASS
  - frontend jest materials: 23/23 PASS
  - code review: 3 rounds, all findings resolved
  - git diff --check: PASS
  - OrchestratorKit/verify-status.sh: PASS (см. прогон после closeout)
manual_browser_check: NOT RUN — визуальный прогон диалога запланирован на
  итоговый browser-аудит цепочки (стек :4200/:3000/mongo поднят); terminology
  и payload покрыты unit-тестами.
known_limitations:
  - Серверная генерация SKU НЕ реализована в этой TZ — вынесена в
    TZ-MATERIALS-307 (Layer 4 successor) как требует правило TZ-303.
  - Существующие материалы с пустым sku не тронуты; backfill при необходимости
    — отдельный TZ.
lock_file: .mimocode/locks/TZ-MATERIALS-303-identity-code.lock
successor_required: TRUE → tasks/TZ-MATERIALS-307-sku-autogeneration.md
