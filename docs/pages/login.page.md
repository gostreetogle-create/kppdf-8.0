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
- **Personal-project notice (TZ-AUTH-301, optional):** мягкий текст «личный проект для обучения и тестирования» для приглашённых. **Не** access control и не юридический щит — см. `docs/ops/home-host-access.md`. `robots noindex` только для поисковиков.
- **Два пароля на проде:** сначала HTTP Basic (`kppdf` / CREDENTIALS § Basic Auth), потом форма `/login` → `admin` / CREDENTIALS § Admin — это **разные** пароли.
- **CSP (TZ-AUTH-302):** desktop URL через `<meta name="kppdf-desktop-download-url">`, без inline `<script>` (Helmet `script-src 'self'`).

---

_Создано: 2026-07-19. Обновлено: 2026-08-11 (TZ-AUTH-302)._
