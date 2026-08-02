═══════════════════════════════════════════════════════════════
TZ-MATERIALS-302: Материалы — единицы и поставщики
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend/Backend Integration Engineer / QA-валидатор

ЗАВИСИМОСТИ: TZ-MATERIALS-301 желательно завершить первым; API-контракт не менять без доказательства.

LAYER: 3 (если потребуется backend contract fix — оформить отдельный Layer 4 successor)

CONFLICT KEYS:
frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/dictionaries/dictionaries.page.ts;frontend/src/app/pages/dictionaries/units.service.ts;frontend/src/app/shared/services/organizations.service.ts;backend/src/modules/unit/unit.controller.ts;backend/src/modules/unit/unit.service.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Material dialog сейчас содержит захардкоженный `<select>` единиц: `m2`, `m3`, `kg`, `sheet`, `pcs`. `UnitsService.listActive()` уже предоставляет `GET /units/active`, а `/dictionaries` содержит форму создания единицы через `POST /units`.

2. Поставщики загружаются через `OrganizationsService.list({ type: 'supplier', limit: 200 })` и отображаются отдельным select. Нужно подтвердить loading/error/empty и корректное сохранение ID.

3. Пользователь сообщает, что добавление единицы в справочнике ранее не сработало. Нельзя считать проблему исправленной без фактического воспроизведения POST, ответа API, обновления списка и повторного выбора в material dialog.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Проверить полный контракт `/dictionaries` → `POST /api/units`, включая права admin, DTO validation, duplicate key, success/error handling и reload. Зафиксировать network/status/body без секретов.

ШАГ 2: Заменить hardcoded units в material dialog на `UnitsService.listActive()`. Показать loading, empty и error состояния; сохранять canonical `Unit.key`, а пользователю показывать `label` и `symbol`.

ШАГ 3: Проверить поставщик: фильтр только active supplier organizations, loading/error/empty, сохранение `supplierId`, edit prefill и отсутствие двойной загрузки.

ШАГ 4: Добавить service/component tests: listActive success/error, create unit success/duplicate/403, material unit payload and supplier payload. Backend contract менять только при подтверждённом несовпадении и отдельном successor-TZ.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/materials/material-form-dialog.component.ts;
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts;
- frontend/src/app/pages/dictionaries/dictionaries.page.ts и/или units.service.ts — только подтверждённый defect;
- соответствующие existing/new specs.

НЕ ИЗМЕНЯТЬ:
- material schema/DTO без отдельного доказательства;
- Organizations API и backend unit API, если контракт уже корректен;
- unrelated forms and task files.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В material dialog нет захардкоженного списка единиц: список приходит из active units API.
2. Созданная в `/dictionaries` единица появляется после reload и доступна для выбора в material dialog.
3. Duplicate/403/validation error показывается пользователю, submit не зависает и не создаёт повторный запрос.
4. Неактивные единицы и неактивные поставщики не предлагаются для нового материала.
5. При редактировании корректные unit и supplier prefilled.
6. Tests покрывают success/error/empty/loading; frontend/backend typecheck и targeted Jest проходят.
7. Browser-check подтверждает путь: создать unit → обновить → выбрать unit при создании material → сохранить.

РУЧНОЙ СЦЕНАРИЙ: `/dictionaries` → создать тестовую единицу → убедиться, что она появилась; `/materials` → «Создать» → выбрать её и поставщика → сохранить; проверить один POST и корректный payload.

ОГРАНИЧЕНИЯ: не создавать новую страницу справочника; существующая `/dictionaries` является источником CRUD.
