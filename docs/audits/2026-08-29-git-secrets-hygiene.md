# Git / secrets hygiene audit — 2026-08-29

> Cursor read-only audit. PO: dev-пароли ок до деплоя; проверить что в GitHub не уехало лишнее.

## Verdict: **чисто по секретам**

| Проверка | Результат |
|----------|-----------|
| `.env`, `backend/.env` в git | **Нет** (`.gitignore` работает; `git log` по `.env` пуст) |
| `deploy/synology/CREDENTIALS.md`, `config.env` | **Не tracked** |
| Mongo URI с паролем в tracked файлах | **Не найдено** |
| API keys (`sk-…`, Perplexity, OpenAI) в коде | **Не найдено** |
| Приватные ключи `.pem` / `id_rsa` tracked | **Нет** |
| `.freebuff/`, `.worktrees/` | В `.gitignore` |

## Ожидаемо в репо (не утечка, dev-канон)

- `admin` / `admin123` в `README.md`, `STACK.md`, `login.page.ts` (кнопка «Заполнить демо»), тестах, smoke-скриптах — **локальный dev seed**, не prod.
- `deploy/synology/*` явно пишет: на проде **не** admin123.
- `SecretValidationService` — на `NODE_ENV=production` слабые пароли **блокируют старт**.

## Замечания (низкий риск)

1. **`deploy/synology/CREDENTIALS.example.md`** — LAN IP `192.168.1.103`, WAN, SSH user `tiit`. Паролей нет; для публичного репо лучше заменить на `<LAN_IP>` / `<SSH_USER>` (TZ опционально).
2. **`docs/pages/login.page.md`** — было `AdminPass123`, код использует `admin123` → исправлено в doc.
3. **`data/Скриншоты ERP/`** — untracked (хорошо); не добавлять в git.
4. **`gh` CLI** на машине нет — private/public репо не проверял; remote: `github.com/gostreetogle-create/kppdf-8.0`.

## До деплоя (уже в `docs/SECURITY-OPERATIONS.md`)

- Сменить `ADMIN_PASSWORD`, `JWT_*`, Basic Auth, `CREDENTIALS.md` на VM.
- `NODE_ENV=production` → guard не пустит demo-default.

## Follow-up (не блокер F3)

- [ ] TZ-OPS-305 (опц.): redact IPs/usernames в `CREDENTIALS.example.md`
- [ ] Pre-push: `git diff --cached` без `.env` / `CREDENTIALS.md` (ручной или hook — отдельная волна)

---

*PO decision 2026-08-29: dev passwords OK until full deploy.*
