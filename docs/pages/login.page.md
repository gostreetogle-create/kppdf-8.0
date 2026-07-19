# Страница: Вход (LoginPage)

**Краткое описание:** Публичная страница аутентификации. Форма username + password.

## Route

```
/login — «KPPDF — Вход»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| POST | `/api/auth/login` | Аутентификация (username + password) → JWT tokens |

## Services

| Сервис | Методы |
|--------|--------|
| `AuthService` | `login(username, password)` — async, возвращает Promise |

## State

| Поле | Тип | Назначение |
|------|-----|-----------|
| `username` | `string` | Two-way bound to input |
| `password` | `string` | Two-way bound to password input |
| `submitting` | `Signal<boolean>` | Флаг отправки |
| `error` | `Signal<string\|null>` | Сообщение об ошибке |
| `passwordVisible` | `Signal<boolean>` | Показать/скрыть пароль |

## Особенности

- **Editorial form** — Paper & Ink дизайн (minimal, centered card)
- **Password visibility toggle** — Eye/EyeOff icons
- **Dev helper** — «Заполнить демо-данные» (admin / AdminPass123), только в dev mode
- **publicOnlyGuard** — already-authed users redirect to /
- **Guard** — `authGuard` не нужен (public page)
- **No httpResource** — использует `AuthService.login()` (async/await, не Observable)

---

_Создано: 2026-07-19._
