═══════════════════════════════════════════════════════════════
TZ-MATERIALS-303: Материалы — понятный код и идентификация
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Product Analyst / API Contract Engineer / Frontend Engineer

ЗАВИСИМОСТИ: Нет. Реализацию начинать только после подтверждения фактического контракта SKU, article и category.

LAYER: 3 (backend auto-generation — отдельный Layer 4 successor при необходимости)

CONFLICT KEYS:
frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/materials/materials.page.ts;backend/src/modules/material/dto/create-material.dto.ts;backend/src/modules/material/material.service.ts;backend/src/modules/material/material.schema.ts;backend/src/modules/category/category.service.ts;backend/src/modules/category/category.schema.ts;docs/pages/materials.page.md;docs/data-model.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. В форме label сейчас `Код (SKU)`, placeholder `SKU`; в списке есть отдельные колонки «Артикул» и «Код». Пользователь не понимает назначение английского термина и обязанность ручного ввода.

2. Backend хранит `sku` как optional unique sparse indexed string, а `article` как optional indexed string. Create DTO не генерирует SKU и не содержит отдельной бизнес-операции генерации. Категории имеют `skuPrefix`, но связь с material creation нужно подтвердить.

3. Доказательство: `material-form-dialog.component.ts`, `materials.page.ts`, `create-material.dto.ts`, `material.schema.ts`, `categories` contracts. Нельзя молча переименовать API-поле или начать генерировать код без решения о backward compatibility.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Зафиксировать в документации различие: «Артикул» — пользовательский/внешний код, «Внутренний код материала» — уникальный системный идентификатор для поиска и связей. Проверить, используется ли `sku` где-либо как внешний код или только как search/index field.

ШАГ 2: Выбрать и записать решение: A) автоматическая генерация `sku` с сохранением ручного override для роли/режима, или B) ручной optional input с русским объяснением. Рекомендация — автоматическая генерация после проверки category prefix и уникальности.

ШАГ 3: Реализовать только согласованный вариант. UI не должен показывать необъяснимое `SKU`; использовать «Внутренний код материала» и hint «создаётся автоматически…» либо «необязательное поле…». Existing records and edit mode must remain compatible.

ШАГ 4: Добавить tests на unique collision, empty/edit payload, displayed terminology and search compatibility. Если генерация требует backend counter/transaction, остановить frontend-часть и создать отдельный successor Layer 4 вместо небезопасной локальной генерации.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/materials/material-form-dialog.component.ts;
- frontend/src/app/pages/materials/materials.page.ts;
- backend material DTO/service/schema — только после подтверждённого решения о генерации;
- relevant specs;
- docs/pages/materials.page.md и docs/data-model.md.

НЕ ИЗМЕНЯТЬ:
- category SKU prefixes без отдельного contract decision;
- import jobs, products и unrelated SKU fields;
- existing records/migrations без отдельного TZ.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В приложении нет необъяснённого label/placeholder «SKU»; русское название и назначение понятны.
2. Документировано, является ли код обязательным, кто его создаёт и можно ли изменить при редактировании.
3. Код уникален на backend, collision обрабатывается без двойного создания.
4. Existing materials открываются и сохраняются без потери `sku`/`article`.
5. Search/list/import contracts остаются совместимыми либо изменения вынесены в отдельный TZ.
6. Tests покрывают create/edit/duplicate/error и frontend/backend typechecks проходят.
7. Browser-check подтверждает понятный UI и фактический POST/PATCH payload.

РУЧНОЙ СЦЕНАРИЙ: создать материал без ручного кода; проверить отображённый код и повторное открытие; отредактировать существующий material с article/sku; убедиться, что значения не перепутаны.

ОГРАНИЧЕНИЯ: не переименовывать Mongo/API-поле `sku` только ради текста UI и не генерировать код на клиенте без серверной гарантии уникальности.
