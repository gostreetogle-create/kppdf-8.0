# TZ-AUTH-304: Вход по приглашению — UI

РОЛЬ АГЕНТА: Senior Angular Product Engineer

ЗАВИСИМОСТИ: TZ-AUTH-303 DONE

LAYER: 3

PAGES: /enroll/:token ; /admin/devices
PAGE_DOCS: enroll.page.md ; admin-devices.page.md

CONFLICT KEYS: frontend/src/app/app.routes.ts ; frontend/src/app/core/auth.service.ts ; frontend/src/app/core/auth.service.spec.ts ; frontend/src/app/core/auth.interceptor.ts ; frontend/src/app/core/auth.interceptor.spec.ts ; frontend/src/app/pages/enroll/enroll.page.ts ; frontend/src/app/pages/enroll/enroll.page.spec.ts ; frontend/src/app/pages/admin/devices-admin.page.ts ; frontend/src/app/pages/admin/devices-admin.page.spec.ts ; frontend/src/app/pages/admin/device-invite-dialog.component.ts ; frontend/src/app/pages/admin/owner-device-invite-dialog.component.ts ; frontend/src/app/pages/admin/device-role-dialog.component.ts ; frontend/src/app/shared/services/pi-device-enrollment.service.ts ; frontend/src/app/pages/admin/admin-group-chips.ts ; docs/pages/enroll.page.md ; docs/pages/admin-devices.page.md ; docs/pages/PAGE-TZ-INDEX.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `frontend/src/app/core/auth.service.ts`; `frontend/src/app/core/auth.interceptor.ts`; `frontend/src/app/app.routes.ts`; `frontend/src/app/pages/admin/users-admin.page.ts`; `docs/pages/admin-users.page.md`; TZ-AUTH-303.

1. Сейчас пользователь видит `/login`, вводит username/password, а access/refresh лежат в localStorage.
2. Целевой поток проще: администратор заранее выбирает готовую роль и копирует ссылку → человек открывает → вводит только имя компьютера → система сразу входит строго в этой роли.
3. Устройство — аккаунт. Никаких полей ФИО, email, логин или пароль в этом потоке нет.
4. Существующий password login остаётся как резервный вход владельца и не удаляется.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Сделать публичную активацию устройства

1. Добавить `/enroll/:token` вне app-shell.
2. Экран содержит:
   - заголовок `Подключение компьютера`;
   - одно поле `Как назвать этот компьютер?`;
   - пример/подсказку: `Например: Офис Марии или Цеховой компьютер`;
   - кнопку `Подключить`;
   - короткий текст: `После подключения откроется подготовленный для вас доступ.`
3. Не показывать логин, пароль, email, роли, IP, технический token или английские слова.
4. GET страницы не активирует invite. Только явная кнопка отправляет POST.
5. После успеха token удаляется из history, AuthService получает device session и открывает первую разрешённую страницу.

### ШАГ 2. Сделать автоматический вход устройства

1. После consume автоматически получить device session, записать только короткий access JWT через существующий AuthService и открыть первую разрешённую страницу.
2. При F5/bootstrap:
   - активный grant-cookie автоматически восстанавливает короткую app-сессию;
   - revoked/expired показывает `Доступ этого компьютера отключён. Обратитесь к администратору.`
3. Для device flow не хранить refresh JWT. При истечении/401 выполнить один single-flight renew через cookie и один retry; без циклов.
4. Обычный password login/refresh и Desktop headers не менять.
5. Устройство не должно ни на мгновение увидеть страницы/действия вне заранее выбранной роли.

### ШАГ 3. Добавить простую страницу администратора «Устройства»

1. Добавить sibling `/admin/devices` и чип `Устройства` рядом с `Пользователи | Роли`.
2. Вверху одна основная кнопка `Создать ссылку`.
3. Обычный диалог выдачи:
   - обязательный выбор одной существующей активной роли **до** создания ссылки;
   - срок ссылки 1 / 3 / 7 дней, default 3;
   - срок доступа компьютера 30 / 90 / 365 дней, default 365;
   - после создания показать оформленную ссылку и кнопку `Копировать`.
4. Только для owner показать отдельную кнопку `Добавить мой компьютер`:
   - запросить текущий пароль owner перед созданием;
   - выдать одноразовую ссылку на 15 минут без role picker;
   - ссылка подключает новый браузер к тому же owner, а не создаёт второго owner.
5. Ordinary admin не видит owner-кнопку, owner devices, скрытого owner или owner-only permissions.
6. Таблица обычных устройств: имя, состояние, назначенная роль, срок, последний вход.
7. Для active: `Изменить роль`, `Изменить срок`, `Отключить этот компьютер`.
8. Отзыв требует подтверждения и не отключает другие компьютеры.
9. В UI использовать только русские слова: `Работает`, `Отключён`.

### ШАГ 4. Закрепить UX тестами и документацией

1. Тесты активации с готовой ролью, revoked, bootstrap/F5 и single-flight renew.
2. Тесты admin role-select/create/copy/change/revoke.
3. Тесты owner-only `Добавить мой компьютер` и отсутствия owner surface у ordinary admin.
4. Обновить page docs и PAGE-TZ-INDEX.
5. Не делать декоративную сложность: одна форма, одна таблица, понятные состояния.

## ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

ИЗМЕНЯТЬ:

- `frontend/src/app/app.routes.ts`
- `frontend/src/app/core/auth.service.ts` и spec
- `frontend/src/app/core/auth.interceptor.ts` и spec
- новые `frontend/src/app/pages/enroll/*`
- новая `frontend/src/app/pages/admin/devices-admin.page.ts` и spec
- новые тонкие dialogs для ссылки и роли
- новый `frontend/src/app/shared/services/pi-device-enrollment.service.ts`
- `frontend/src/app/pages/admin/admin-group-chips.ts`
- `docs/pages/enroll.page.md`
- `docs/pages/admin-devices.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

НЕ ИЗМЕНЯТЬ:

- backend — predecessor TZ-AUTH-303.
- `frontend/src/app/pages/login/login.page.ts` кроме строго необходимой совместимости; не удалять password login.
- Desktop pairing UI/services.
- owner invariant приходит из TZ-AUTH-306; не добавлять выдаваемую роль `superadmin`.
- nginx/prod — TZ-AUTH-305.
- IP binding, личные профили работников, биометрию/fingerprint browser.

## КРИТЕРИИ ПРИЁМКИ

1. Получатель ссылки вводит ровно одно пользовательское значение: имя компьютера.
2. Роль обязательно выбрана администратором до создания regular link и не может быть изменена получателем.
3. После ввода имени вход происходит автоматически и сразу ограничен подготовленной ролью; пароль никогда не показывается и не спрашивается.
4. После F5 и повторного открытия браузера активное устройство входит автоматически.
5. Default: invite 3 дня, устройство 365 дней; администратор может выбрать другой доступный срок.
6. Администратор видит и отдельно отключает конкретный компьютер.
7. Общий ПК может называться `Цеховой компьютер`; аудит остаётся на уровне устройства, без ложного определения человека.
8. Все пользовательские тексты на русском; состояния и ошибки объясняют следующий шаг.
9. Gates:
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm test -- auth.service --runInBand`
   - `cd frontend && pnpm test -- auth.interceptor --runInBand`
   - `cd frontend && pnpm test -- enroll --runInBand`
   - `cd frontend && pnpm test -- devices-admin --runInBand`
10. Browser/DOM smoke: choose role → create link → redeem/name → immediate scoped ERP entry → F5 → revoke → blocked within five minutes; отдельно owner creates 15m self-device link → second owner browser works.
11. Перед archive заполнен `docs/agent-checklists/TZ-AUTH-304.md`, приложен `## Executor report (auto)` и получен Cursor/PO PASS.

## known_limitation

- До TZ-AUTH-305 Basic Auth остаётся перед UI, поэтому внешний пользовательский rollout ещё не завершён.
- Устройство является единым субъектом. На общем ПК система не различает работников.
- Owner invariant — predecessor TZ-AUTH-306; ordinary admin не видит owner surface.

## ФИНАЛИЗАЦИЯ

Root task: следовать `GEMINI.md`, архивировать в `tasks/_archive/YYYY-MM/`, обновить checklist/progress/ARCHITECTURE и не деплоить без отдельной команды PO.
