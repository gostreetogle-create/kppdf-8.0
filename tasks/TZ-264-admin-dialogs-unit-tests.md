═══════════════════════════════════════════════════════════════
TZ-264: Admin-диалоги — unit-тесты для 3 dialog-компонентов
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: QA-валидатор / Frontend Component Engineer

ЗАВИСИМОСТИ: TZ-261 (диалоги должны компилироваться, чтобы их можно было
             инстанцировать в TestBed). ВАЖНО: этот TZ — ТОЛЬКО новые
             spec-файлы (additive). Диалоговые `.ts`-компоненты НЕ менять
             — если тесту нужен доступ, мокай через DI-токены
             (PI_DIALOG_DATA / PI_DIALOG_REF / PermissionsCatalogService).
             Sequencing: выполняется ПОСЛЕ TZ-265 (или строго
             последовательно с ним) — spec-ы компилируют те же диалоговые
             компоненты, которые TZ-265 редактирует, поэтому тесты должны
             писаться против ФИНАЛЬНЫХ компонентов. НЕ запускать в один
             момент с TZ-265.

LAYER: 3 (добавление новых spec-файлов; компоненты НЕ редактируются)

CONFLICT KEYS:
frontend/src/app/pages/admin/user-form-dialog.component.ts;
frontend/src/app/pages/admin/user-form-dialog.component.spec.ts (NEW);
frontend/src/app/pages/admin/role-form-dialog.component.ts;
frontend/src/app/pages/admin/role-form-dialog.component.spec.ts (NEW);
frontend/src/app/pages/admin/reset-password-dialog.component.ts;
frontend/src/app/pages/admin/reset-password-dialog.component.spec.ts (NEW)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. В `frontend/src/app/pages/admin/` существует ТОЛЬКО ОДИН spec-файл:
   `users-admin.page.spec.ts` (5 тестов: create/refresh, LAST_ADMIN
   invariant 403 → toast, error mapping, success toast+refresh).
   Три диалога (UserFormDialog, RoleFormDialog, ResetPasswordDialog)
   unit-тестов НЕ имеют.

2. Проблемы / неточности текущего состояния:
   - Нулевое покрытие валидационных функций: `canSubmit()` в
     user-form (username≥3, email regex, password≥8 в create-mode),
     в reset-password (password≥8, confirm match → error «Пароли не
     совпадают»), в role-form (name regex `/^[a-z][a-z0-9_-]{1,63}$/`).
   - Нулевое покрытие `role-form-dialog` каталога permissions
     (loadCatalog: loading → sections → error state) и логики
     toggleKey/toggleSection/sectionAllSelected/selectedCount.
   - Важно: существующий `users-admin.page.spec.ts` мокает HTTP и НЕ
     компилирует шаблоны диалогов — поэтому P0-баг TZ-261 (касты `as`
     в template) прошёл незамеченным. Нужен как минимум один smoke-тест,
     который ИНСТАНЦИРУЕТ диалог через TestBed (это форсирует компиляцию
     template и ловит NG5xxx навсегда).

3. Контекст (внешние зависимости, conventions, нюансы):
   - Проектная конвенция: jest + TestBed + `provideHttpClientTesting()`
     для компонентов с HTTP; см. `users-admin.page.spec.ts` и
     `shared/services/*.spec.ts`.
   - Диалоги получают `PI_DIALOG_DATA` / `PI_DIALOG_REF` через
     injection tokens — в тесте их надо провайдить вручную:
     `{ provide: PI_DIALOG_DATA, useValue: {...} }`,
     `{ provide: PI_DIALOG_REF, useValue: mockRef }`.
   - `role-form-dialog` инжектит `PermissionsCatalogService` — можно
     мокать через `provideHttpClientTesting()` + HttpTestingController.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: `reset-password-dialog.component.spec.ts` — минимальный набор:
       1. Smoke: компонент создаётся (TestBed инстанцирует → template
          компилируется — регрессионная защита от NG5xxx).
       2. `canSubmit()` = false при password < 8, true при ≥ 8.
       3. При password ≠ confirm `onSubmit()` ставит error
          «Пароли не совпадают» и НЕ закрывает диалог.
       4. При password == confirm `ref.close(password)` вызывается.

ШАГ 2: `user-form-dialog.component.spec.ts`:
       1. Smoke-создание (create-mode и edit-mode).
       2. `canSubmit()`: false при username < 3; false при невалидном
          email; false при password < 8 в create-mode; true при валидных.
       3. `onSubmit()` в create-mode возвращает result с `password`;
          в edit-mode — без `password`.

ШАГ 3: `role-form-dialog.component.spec.ts`:
       1. Smoke-создание.
       2. loadCatalog: при успехе `sections()` заполнен, `catalogLoading`
          = false; при HTTP-ошибке `catalogError()` не null.
       3. toggleKey добавляет/удаляет ключ; sectionAllSelected и
          toggleSection корректны; selectedCount растёт.

ШАГ 4: Запустить `npx jest src/app/pages/admin` — все старые (5) и новые
       тесты зелёные; убедиться, что хотя бы один тест инстанцирует
       каждый диалог (template компилируется).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/admin/reset-password-dialog.component.spec.ts (NEW)
- frontend/src/app/pages/admin/user-form-dialog.component.spec.ts (NEW)
- frontend/src/app/pages/admin/role-form-dialog.component.spec.ts (NEW)

НЕ ИЗМЕНЯТЬ (явно перечислите):
- frontend/src/app/pages/admin/*-dialog.component.ts  [компоненты НЕ трогать — тесты аддитивные;
  TZ-261 уже починил шаблоны, TZ-265 правит их styles — чтобы не было merge-конфликта]
- backend/**, .agents/skills/** (TZ-263), app.routes.ts (TZ-262),
  users-admin.page.ts / roles-admin.page.ts (их существующие spec-ы не трогать)
- progress.md, ARCHITECTURE.md, _templates/*

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Созданы 3 spec-файла (reset-password, user-form, role-form).
2. Каждый spec содержит минимум 1 тест, ИНСТАНЦИРУЮЩИЙ компонент через
   TestBed (template-компиляция — защита от регрессии NG5xxx).
3. Покрыты: canSubmit (все 3 диалога), mismatch-пароли, loadCatalog
   успех/ошибка, toggleKey/toggleSection.
4. `npx jest src/app/pages/admin` — все тесты PASS (старые 5 + новые).
5. Frontend typecheck exit 0.

═══════════════════════════════════════════════════════════════
TZF-00: ОБЯЗАТЕЛЬНАЯ ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

После завершения работы применить TZF-00 (_templates/TZF-00.txt).
Выполняет агент-исполнитель ПОСЛЕ TZ-264.
