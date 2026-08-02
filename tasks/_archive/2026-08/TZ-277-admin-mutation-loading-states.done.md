═══════════════════════════════════════════════════════════════
TZ-277: Admin pages — loading states для мутаций
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer / QA-валидатор

ЗАВИСИМОСТИ: TZ-274 (capabilities gating)

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/admin/users-admin.page.ts;frontend/src/app/pages/admin/roles-admin.page.ts;frontend/src/app/pages/admin/user-form-dialog.component.ts;frontend/src/app/pages/admin/role-form-dialog.component.ts;frontend/src/app/pages/admin/reset-password-dialog.component.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. На страницах `/admin/users` и `/admin/roles` отсутствуют индикаторы загрузки при выполнении мутаций (создание, редактирование, сброс пароля, переключение active-состояния, удаление).
2. При создании пользователя через `user-form-dialog.component.ts` кнопка «Создать» не переходит в состояние «Сохранение…» и не блокируется во время запроса.
3. При сбросе пароля через `reset-password-dialog.component.ts` нет индикатора загрузки.
4. При удалении пользователя/роли через `PiRowActions` нет индикатора загрузки в строке.
5. Пользователь может повторно нажать кнопку «Создать» или «Удалить» во время выполнения запроса, что приводит к двойным/множественным мутациям.
6. Проектная конвенция (`DEVELOPMENT-PATTERNS.md` §4) требует `submitting` signal и блокировки кнопки при мутациях в формах. Для действий в строках таблицы (`PiRowActions`) блокировки нет.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: В `users-admin.page.ts` добавить `submitting` signal для каждой мутации (create, edit, resetPassword, toggleActive, delete). При начале запроса `submitting.set(true)`, при ответе `submitting.set(false)`.

ШАГ 2: В `roles-admin.page.ts` аналогично добавить `submitting` signal для create, edit, delete.

ШАГ 3: В `user-form-dialog.component.ts` добавить `submitting` signal (по проектной конвенции из `DEVELOPMENT-PATTERNS.md` §4). Кнопка «Сохранить» блокируется при `submitting()`, текст меняется на «Сохранение…».

ШАГ 4: В `role-form-dialog.component.ts` аналогично добавить `submitting` signal и блокировку кнопки.

ШАГ 5: В `reset-password-dialog.component.ts` добавить `submitting` signal и блокировку кнопки «Сбросить» во время запроса.

ШАГ 6: Для действий в строках таблицы (delete, toggle active, reset password) — добавить `loadingRowId` signal, который хранит ID строки, для которой выполняется мутация. `PiRowActions` получает `loading` input и показывает индикатор прогресса на соответствующей строке.

ШАГ 7: Добавить unit-тесты, проверяющие что кнопки блокируются при мутации и разблокируются после ответа (успех или ошибка).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/admin/users-admin.page.ts — добавить submitting/loadingRowId signals, блокировку кнопок
- frontend/src/app/pages/admin/roles-admin.page.ts — аналогично
- frontend/src/app/pages/admin/user-form-dialog.component.ts — добавить submitting signal, блокировку кнопки
- frontend/src/app/pages/admin/role-form-dialog.component.ts — аналогично
- frontend/src/app/pages/admin/reset-password-dialog.component.ts — добавить submitting signal, блокировку кнопки
- frontend/src/app/shared/ui/pi-row-actions/pi-row-actions.component.ts — добавить loading input для индикатора в строке
- frontend/src/app/pages/admin/users-admin.page.spec.ts — тесты блокировки кнопок
- frontend/src/app/pages/admin/roles-admin.page.spec.ts — тесты блокировки кнопок

НЕ ИЗМЕНЯТЬ:
- backend endpoints — они уже корректно обрабатывают мутации
- PiDialogService — общая логика диалогов не меняется
- PiPageHeaderComponent, PiSectionComponent — не затрагиваются

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. При начале мутации (create/edit/delete/resetPassword/toggleActive) кнопка «Сохранить» блокируется и показывает «Сохранение…».
2. При ошибке API кнопка разблокируется, диалог остаётся открытым с сообщением об ошибке.
3. При успешном ответе кнопка разблокируется, диалог закрывается.
4. Двойной клик по «Создать» не создаёт второго пользователя (submitting signal предотвращает повторный submit).
5. При мутации в строке таблицы (delete, toggle, reset password) в этой строке отображается индикатор загрузки.
6. `pnpm exec tsc --noEmit` в frontend проходит с exit code 0.
7. Существующие unit-тесты проходят.
8. Добавлены новые unit-тесты для сценариев блокировки/разблокировки кнопок.
9. В консоли браузера нет ошибок при прохождении сценариев мутаций.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ ПРОВЕРКИ
═══════════════════════════════════════════════════════════════

1. Запустить приложение (`node start.mjs`).
2. Войти администратором.
3. Перейти на /admin/users.
4. Нажать «Создать пользователя».
5. Заполнить форму и нажать «Создать».
6. Убедиться, что кнопка заблокирована и показывает «Сохранение…».
7. Убедиться, что повторный клик по кнопке не создаёт второго пользователя.
8. После успешного создания убедиться, что диалог закрывается и кнопка разблокируется.
9. Повторить для редактирования пользователя (кнопка «Сохранить»).
10. Повторить для сброса пароля (кнопка «Сбросить»).
11. Повторить для переключения active-состояния (индикатор в строке).
12. Повторить для удаления пользователя (индикатор в строке).
13. Повторить все шаги для /admin/roles.

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Все кнопки мутаций блокируются при выполнении запроса.
- Двойной submit предотвращён.
- Индикатор загрузки отображается в строке таблицы при мутациях в строке.
- Typecheck frontend проходит.
- Unit-тесты покрывают сценарии блокировки/разблокировки.
- Ручная проверка подтверждает корректность для всех мутаций на обеих admin-страницах.

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- Для `PiRowActions` добавление `loading` input — это расширение существующего компонента, которое может потребовать обновления всех потребителей (materials, organizations, dictionaries, work-types, modules, products, orders, contracts).
- Индикатор загрузки в строке таблицы — дополнительный visual element, который нужно согласовать с дизайном Paper & Ink.
- SubmitGuard для форм в диалогах — проектная конвенция, но в текущих admin-диалогах он не используется (прямой `subscribe` на `service.create/update`).
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
protected_files:
  - frontend/src/app/pages/admin/users-admin.page.ts
  - frontend/src/app/pages/admin/users-admin.page.spec.ts
  - frontend/src/app/pages/admin/roles-admin.page.ts
  - frontend/src/app/pages/admin/roles-admin.page.spec.ts
  - frontend/src/app/pages/admin/user-form-dialog.component.ts
  - frontend/src/app/pages/admin/user-form-dialog.component.spec.ts
  - frontend/src/app/pages/admin/role-form-dialog.component.ts
  - frontend/src/app/pages/admin/role-form-dialog.component.spec.ts
  - frontend/src/app/pages/admin/reset-password-dialog.component.ts
  - frontend/src/app/pages/admin/reset-password-dialog.component.spec.ts
  - frontend/src/app/shared/ui/pi-row-actions/pi-row-actions.component.ts
  - frontend/src/app/shared/ui/pi-row-actions/pi-row-actions.component.spec.ts
  - docs/agent-checklists/TZ-277.md
verification:
  - acceptance criteria: PASS
  - targeted frontend Jest: PASS (6 suites, 58 tests)
  - frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - frontend ng build development: PASS (`pnpm exec ng build --configuration=development`)
  - targeted frontend ESLint: PASS (0 errors; 2 pre-existing raw-HttpClient architecture warnings)
  - git diff --check: PASS (only Windows LF/CRLF normalization warnings)
  - independent review: PASS with no critical or important findings
  - checklist: UPDATED (`docs/agent-checklists/TZ-277.md`)
  - browser: MANUAL_BROWSER_CHECK_REQUIRED (no live authenticated browser flow)
notes:
  - Form dialogs receive typed mutation callbacks, own submitting/error lifecycle, stay open on API failure, and close only after success.
  - Row mutations use loadingRowId and PiRowActions loading to block duplicate actions and hide all row action buttons while active.
