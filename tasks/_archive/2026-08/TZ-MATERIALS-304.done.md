═══════════════════════════════════════════════════════════════
TZ-MATERIALS-304: Материалы — отделить остатки от карточки (DONE)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Domain Model Analyst / Backend Engineer / Frontend Engineer

РЕЗУЛЬТАТ (consumer audit → matrix источника истины)
═══════════════════════════════════════════════════════════════

Canonical owner остатка — складской контур: `StorageItem.quantity`,
`minQuantity`, stock movements, inventory-dashboard. `Material.stockQty` —
legacy, объявлен deprecated. Связь material→склад ОТСУТСТВУЕТ:
`StorageItem.productId` ссылается на Product (required, index), а не на
материал → оформлен отдельный Layer 4 domain successor TZ-MATERIALS-308.

СДЕЛАНО
═══════

1. Frontend (material-form-dialog.component.ts):
   - поле «Остаток на складе» (input) убрано из create/edit; вместо него
     read-only индикатор «Управляется в разделе „Склад" и не вводится при
     создании материала» (hairline rounded-sm bg-paper-2 — штатные
     Paper & Ink токены, прецедент в этом же файле);
   - form control `stockQty` удалён; patchFromData-строка удалена;
   - payload больше не содержит `stockQty` (ни create, ни update).
2. Frontend (materials.page.ts): колонка «Остаток» удалена из списка
   (список больше не показывает legacy stockQty как canonical balance).
3. Backend: schema/DTO НЕ изменялись — `stockQty` остаётся для backward
   compatibility старых записей/API (по правилу TZ: не удалять и не
   мигрировать молча). legacy-клиент может сохранить stockQty в deprecated
   поле Material.stockQty, но никогда в StorageItem.
4. Registry descriptor (`registry.service.ts`, material fields) НЕ тронут:
   он питает Document Constructor (шаблоны могут ссылаться на
   material.stockQty) — сохранён сознательно, причина зафиксирована.
5. Docs: docs/data-model.md (stockQty → LEGACY/deprecated, canonical owner
   StorageItem.quantity, ссылка на TZ-308) и docs/pages/materials.page.md
   (8 колонок, блок «Остаток» с пояснением).
6. Создан successor: tasks/TZ-MATERIALS-308-material-stock-link.md (Layer 4) —
   доменная связка материал→склад (StorageItem.materialId XOR productId).

ПРОВЕРКИ
════════

- frontend tsc (tsconfig.app.json --noEmit): PASS (0 errors; исключены
  параллельные TZ-DOC-файлы, не в conflict keys этой TZ)
- frontend jest materials: 2 suites / 26 tests PASS (включая 3 новых TZ-304:
  нет stockQty control, payload без stockQty, legacy material со stockQty
  открывается и payload без stockQty)
- code-reviewer-deepseek-flash: 2 раунда — findings устранены (TZ-id в
  user-facing тексте убран; bg-surface/border-border → hairline/bg-paper-2;
  heading «9 колонок» → «8 колонок»; registry rationale зафиксирован)
- git diff --check: PASS (только LF/CRLF warnings)
- Полный `ng build` — пере-прогон в конце цепочки (параллельная
  TZ-DOC-сессия чинит свои файлы).

ИЗМЕНЁННЫЕ ФАЙЛЫ
════════════════

- frontend/src/app/pages/materials/material-form-dialog.component.ts
- frontend/src/app/pages/materials/materials.page.ts
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts (+3 теста)
- docs/data-model.md
- docs/pages/materials.page.md
- tasks/TZ-MATERIALS-308-material-stock-link.md (NEW successor)

НЕ ИЗМЕНЯЛИСЬ (по плану):
- backend material schema/DTO (backward compat), registry.service.ts
  (doc-constructor template compat), product stockQty semantics,
  database data/migrations.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (Codebuff session)
protected_files:
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
acceptance_status: PASS
verification:
  - frontend tsc --noEmit: PASS
  - frontend jest materials: 26/26 PASS
  - code review: 2 rounds, all findings resolved
  - git diff --check: PASS
  - OrchestratorKit/verify-status.sh: PASS (прогон после closeout)
manual_browser_check: NOT RUN — создание материала без запроса остатка
  покрыто unit-тестами; визуальный прогон диалога и склада — на итоговый
  browser-аудит цепочки (стек :4200/:3000/mongo поднят).
known_limitations:
  - Material.stockQty сохранён в schema/DTO: legacy API-клиент может
    сохранить его в deprecated поле (никогда в StorageItem); это
    задокументированный backward-compat план, не bypass whitelist.
  - Связь material→склад отсутствует (StorageItem.productId → Product):
    реализация вынесена в TZ-MATERIALS-308 (Layer 4 domain successor).
  - Registry descriptor material.stockQty сохранён для Document Constructor
    template compatibility.
lock_file: .mimocode/locks/TZ-MATERIALS-304-stock-boundary.lock
successor_required: TRUE → tasks/TZ-MATERIALS-308-material-stock-link.md
