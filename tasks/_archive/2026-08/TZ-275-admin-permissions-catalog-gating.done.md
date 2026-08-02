═══════════════════════════════════════════════════════════════
TZ-275: Permissions catalog endpoint — недостаточный gating
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer / QA-валидатор

ЗАВИСИМОСТИ: TZ-255 (PermissionsGuard), TZ-257 (admin module)

LAYER: 4

CONFLICT KEYS:
backend/src/modules/admin/permissions-admin.controller.ts;backend/src/common/seed/permissions.constants.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `PermissionsAdminController.catalog()` обслуживает GET /api/admin/permissions.
2. Endpoint использует только `@Permissions('role:read')` и `@Roles('admin')`.
3. Endpoint возвращает полный каталог всех permission keys (включая `user:admin`, `role:admin`, `product:admin` и т.д.).
4. Frontend `role-form-dialog.component.ts` использует этот каталог для рендеринга чекбоксов при редактировании роли.
5. Пользователь с правом `role:read` (но не `role:admin` или `role:write`) может получить полный список всех permission keys через этот endpoint.
6. Каталог permissions — это чувствительные данные: раскрывают структуру RBAC-системы и все доступные действия.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Изменить `@Permissions('role:read')` на `@Permissions('role:admin')` в `PermissionsAdminController.catalog()`.

ШАГ 2: Обоснование: endpoint используется исключительно для редактирования ролей (role-form-dialog). Пользователь, который может редактировать роли, должен иметь `role:admin`. Чтение каталога permissions — часть операции записи (редактирования роли), а не самостоятельное чтение.

ШАГ 3: Если `role:admin` слишком строгий (менеджер должен видеть каталог для создания ролей), использовать `@Permissions('role:write')` — это позволяет редактировать роли и видеть их разрешения, но не удалять системные роли (для этого есть `role:admin`).

ШАГ 4: Добавить `@AuditAction({ action: 'admin.permissions.catalog', entityType: 'Permission' })` для аудита доступа к полному каталогу permissions.

ШАГ 5: Добавить e2e-тест в `backend/test/e2e/permissions-admin.e2e-spec.ts` (или обновить существующий), проверяющий что запрос без `role:admin`/`role:write` получает 403.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- backend/src/modules/admin/permissions-admin.controller.ts — заменить `@Permissions('role:read')` на `@Permissions('role:admin')` (или `role:write`), добавить `@AuditAction`
- backend/test/e2e/permissions-admin.e2e-spec.ts — добавить тест 403 для не-admin пользователя (если файл существует) или создать новый e2e spec

НЕ ИЗМЕНЯТЬ:
- backend/src/common/seed/permissions.constants.ts — каталог permissions не меняется
- frontend/src/app/pages/admin/role-form-dialog.component.ts — фронтенд уже корректно использует endpoint
- frontend/src/app/shared/services/pi-permissions.service.ts — сервис уже корректен

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. GET /api/admin/permissions возвращает 403 для пользователя с `role:read` без `role:admin`/`role:write`.
2. GET /api/admin/permissions возвращает 200 для пользователя с `role:admin`.
3. Audit log записывает доступ к каталогу permissions с `action: 'admin.permissions.catalog'`.
4. `pnpm exec tsc --noEmit` в backend проходит с exit code 0.
5. Существующие e2e-тесты проходят.
6. Новый e2e-тест проверяет 403 для не-admin пользователя.
7. В документации обновлён описание endpoint с новым требованием к правам.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ ПРОВЕРКИ
═══════════════════════════════════════════════════════════════

1. Запустить приложение (`node start.mjs`).
2. Войти пользователем с ролью `manager` и правом `role:read` (без `role:admin` и `role:write`).
3. Выполнить GET /api/admin/permissions через API-клиент (Postman/curl).
4. Убедиться, что ответ — 403 Forbidden.
5. Войти пользователем с ролью `admin`.
6. Выполнить GET /api/admin/permissions.
7. Убедиться, что ответ — 200 OK с полным каталогом permissions.
8. Проверить audit log — должна быть запись `admin.permissions.catalog`.

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Endpoint /api/admin/permissions требует `role:admin` (или `role:write`) вместо `role:read`.
- Audit log записывает доступ к каталогу.
- Typecheck backend проходит.
- e2e-тест покрывает сценарий 403 для не-admin пользователя.
- Backend authorisation остаётся authoritative — frontend гейтинг не влияет на безопасность.

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- Если `role:admin` выбран вместо `role:write`, менеджеры без права записи в роли не смогут видеть каталог permissions. Это может быть нежелательно для UX при создании новых ролей.
- Выбор между `role:admin` и `role:write` зависит от бизнес-требований: должен ли менеджер видеть полный каталог permissions при создании роли.
- Audit log для read-операций может генерировать много записей при массовом использовании.
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
protected_files:
  - backend/src/modules/admin/permissions-admin.controller.ts
  - backend/src/modules/admin/permissions-admin.controller.spec.ts
  - backend/src/common/interceptors/audit.interceptor.ts
  - backend/src/common/interceptors/audit.interceptor.spec.ts
  - backend/test/e2e/permissions-admin.e2e-spec.ts
  - docs/RBAC-CONTRACT.md
  - docs/agent-checklists/TZ-275.md
verification:
  - acceptance criteria: PASS
  - targeted backend Jest: PASS (3 suites, 35 tests)
  - backend permissions catalog e2e: PASS (1 suite, 2 tests; Mongo-backed)
  - backend typecheck: PASS (`pnpm exec tsc --noEmit`)
  - targeted backend ESLint: PASS (including e2e with `--no-ignore`)
  - git diff --check: PASS (Windows LF/CRLF normalization warning only)
  - independent review: PASS with no critical or important findings
  - checklist: UPDATED (`docs/agent-checklists/TZ-275.md`)
  - browser: MANUAL_BROWSER_CHECK_REQUIRED (no live authenticated browser flow)
notes:
  - The endpoint intentionally requires both legacy `@Roles('admin')` and effective `role:write`; role:read-only users are rejected by PermissionsGuard with 403.
  - `AuditAction.auditRead` is an explicit opt-in so only this sensitive GET emits `admin.permissions.catalog`; ordinary GET routes remain unaudited.
  - `backend/src/common/seed/permissions.constants.ts` and frontend consumers were unchanged.
