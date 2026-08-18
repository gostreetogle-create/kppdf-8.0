# Страница: Подключение компьютера (`EnrollPage`)

**Краткое описание:** публичная активация устройства по одноразовой ссылке.
Получатель вводит РОВНО одно пользовательское значение — имя компьютера —
и сразу входит строго в заранее выбранной роли. Без логина, пароля, email,
ФИО, ролей, токенов и английских слов.

## Route

```
/enroll/:token — «KPPDF — Подключение компьютера»
```

Вне app-shell и вне authGuard (публичная). GET страницы НЕ активирует
invite — только явная кнопка «Подключить» шлёт POST (link scanner мессенджера
не должен активировать устройство).

## Поток активации

1. Пользователь открывает `/enroll/:token` — видит заголовок
   «Подключение компьютера», одно поле «Как назвать этот компьютер?»
   (placeholder: «Например: Офис Марии или Цеховой компьютер»), кнопку
   «Подключить», а также уведомление о сохранении имени и cookie со ссылкой на политику ПДн.
2. Кнопка → `POST /api/device/enroll { secret, deviceName }` (TZ-AUTH-303).
3. Успех (200):
   - `AuthService.applyDeviceAccess(access)` — сохраняется ТОЛЬКО короткий
     access JWT (≤5 мин), refresh JWT не хранится; браузер помечается
     device-сессией (`kppdf.device` в localStorage);
   - `AuthService.ensureUser()` — `/auth/me` наполняет user (роль +
     permissions + pages);
   - `router.navigateByUrl('/', { replaceUrl: true })` — одноразовый token
     удаляется из истории браузера; роутер сам резолвит первую разрешённую
     страницу по page ACL роли.
4. Ошибки (безопасный RU-копирайт):
   - 409 → «Эта ссылка уже была использована.»;
   - 410/400/404 → «Приглашение недействительно или истекло. Обратитесь
     к администратору.»;
   - серверный message (5xx) → как есть; сеть/прочее → «Не удалось
     подключить компьютер. Попробуйте ещё раз.».

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| POST | `/device/enroll` | consume одноразового invite `{ secret, deviceName }`; ставит cookie `__Host-kppdf-device`, возвращает `{ access, deviceName, role, expiresAt, isOwner, sessionKind: 'device' }` |

## Services

| Сервис | Методы |
|--------|--------|
| `PiDeviceEnrollmentService` | `enroll(secret, deviceName)` |
| `AuthService` | `applyDeviceAccess`, `ensureUser` |

## Device-сессия после активации

- F5/bootstrap: браузер помечен device (`kppdf.device=1`, refresh нет) →
  `bootstrapDevice()` → `GET /device/status` + `GET /device/session`
  (cookie-only) → свежий access JWT → `/auth/me`.
- revoke/expired: `deviceDenied` («Доступ этого компьютера отключён.
  Обратитесь к администратору.») — показывается на `/login`; межсессионный
  401 → interceptor renewDevice (single-flight) → deny → `/login`.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-AUTH-303 | backend: public enroll/session/status/auth-check (cookie-only) |
| TZ-AUTH-304 | UI: одна форма, одно поле, немедленный scoped-вход |
| TZ-COMP-401 | Добавлено уведомление о сохранении имени/cookie и ссылка на политику ПДн |

## Особенности

- Никакой ПДн, кроме введённого имени компьютера (устройство — аккаунт).
- GET не consume; повторное использование ссылки → 409.
- Все тексты на русском.

---

_Создано: 2026-08-13 (TZ-AUTH-304)._
