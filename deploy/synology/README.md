# Deploy — KPPDF 8.0 (Synology VM)

> **Одна точка входа.** Секреты не в git: `CREDENTIALS.md` + `config.env`.

| Файл | Зачем |
|------|--------|
| **`deploy.ps1`** / **`deploy.sh`** | Запуск деплоя одной командой |
| **`deploy.py`** | Реальная логика (build → SSH → docker) |
| **`config.env.example`** | Шаблон → скопировать в `config.env` |
| **`CREDENTIALS.example.md`** | Шаблон → `CREDENTIALS.md` |
| **`RUNBOOK.md`** | Короткий чеклист (502, бэкап, VPN) |
| **`DEPLOY.md`** | Архитектура (VPS + tunnel + VM) |
| **`INSTALL.md`** | Установка с нуля |
| **`backup.sh`** | Бэкап Mongo на VM |
| **`reset-admin-password.py`** | Сброс пароля admin (опционально) |

---

## Обычный update (то, что нужно 99% времени)

С **Windows** (из корня репо, **VPN выключен**):

```powershell
.\deploy\synology\deploy.ps1
```

С **Linux / macOS / Git Bash**:

```bash
./deploy/synology/deploy.sh
```

Или напрямую:

```powershell
python deploy/synology/deploy.py
```

Скрипт: `pnpm` build FE → архив → SSH на VM → `docker compose` → health + login check.  
Данные Mongo **не** трогает (`WIPE=false`).

---

## Первый раз на этой машине (5 минут)

```powershell
# 1) зависимости
pip install -r deploy/synology/requirements.txt

# 2) секреты (gitignore)
copy deploy\synology\config.env.example deploy\synology\config.env
copy deploy\synology\CREDENTIALS.example.md deploy\synology\CREDENTIALS.md
# заполнить config.env + CREDENTIALS.md (пароли SSH, JWT, ADMIN_PASSWORD, ключ)

# 3) SSH-ключ на VM (один раз)
# ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\kppdf80-vm -N ""
# затем pubkey в ~/.ssh/authorized_keys на VM; в config.env:
# DEPLOY_SSH_KEY=C:\Users\YOU\.ssh\kppdf80-vm

# 4) деплой
.\deploy\synology\deploy.ps1
```

Preflight (опционально): `.\deploy\synology\preflight.ps1`

---

## Флаги

| Команда | Смысл |
|---------|--------|
| `.\deploy\synology\deploy.ps1` | Update (без wipe) |
| `.\deploy\synology\deploy.ps1 -Seed` | Update + restart bootstrap seeds |
| `.\deploy\synology\deploy.ps1 -Wipe -Seed` | **Снос** app+mongo и чистая установка |
| `.\deploy\synology\deploy.ps1 -SkipBuild` | Без пересборки Angular (уже есть `frontend/browser/`) |

Эквивалент Python:

```powershell
python -u deploy/synology/deploy.py --skip-build          # быстрый update
python -u deploy/synology/deploy.py --no-cache            # полный docker rebuild (медленно)
python -u deploy/synology/deploy.py --wipe --seed         # чистая БД
```

> **`-Wipe` только пока система не в реальной работе.** Когда PO скажет «работаем» — wipe запрещён.

### Как устроен быстрый путь (канон)

1. **Angular собирается локально** (`pnpm --dir frontend build` → `frontend/browser/`).
2. В tar уходит: `backend/` (исходники) + `frontend/browser/` + `docker-compose.prod.yml`.
3. На VM: `docker compose build backend` **с кэшем слоёв** (по умолчанию) → `up -d`.
4. **Не** запускать два деплоя параллельно и **не** злоупотреблять `--no-cache` — на маленькой VM два `--no-cache` зависают и душат CPU.

`--no-cache` нужен только если менялись `backend/Dockerfile` / lockfile / базовый image.

---

## После клона репо

1. `pip install -r deploy/synology/requirements.txt`
2. Скопировать `config.env.example` → `config.env`, `CREDENTIALS.example.md` → `CREDENTIALS.md`, заполнить.
3. VPN off → `.\deploy\synology\deploy.ps1`

Деплой только с ПК в домашней сети (LAN к VM). **GitHub Actions / облачный CI не используем.**

---

## Desktop installer (TZD-16 / TZD-24)

Windows installer is published as **ZIP** (preferred) plus optional `.exe` alongside.
After `cd desktop && pnpm tauri build`, run `pnpm run publish-installer` (copies
`.exe` and builds `kppdf-desktop-setup.zip` with a single `kppdf-desktop-setup.exe`
entry into `frontend/downloads/` and `frontend/browser/downloads/`). Deploy
`build_frontend` does the same via `zipfile`. Backend mounts that folder at
`/downloads/` and **never** SPA-falls back those paths. Default pairing button:
`/downloads/kppdf-desktop-setup.zip`. Set `DESKTOP_DOWNLOAD_URL` in
`deploy/synology/config.env` (or the process environment); `deploy.py` injects it
into the SPA. Leave unset for the same-origin default, or set explicitly empty to
disable the button. Do not commit the `.exe`/`.msi`/`.zip`. MCP host still needs
Node.js on the client until sidecar bundling lands.

## После деплоя — проверка

```
https://kppdf-crm.ru/
https://kppdf-crm.ru/api/health/ready
```

Логин admin — **только** из `CREDENTIALS.md` (не `admin123`).

Если стили «голые» — Ctrl+F5 (кэш). Если 401 — неверный пароль или softlock после 5 ошибок (~15 мин / restart backend).

---

## Уроки первого деплоя (2026-08-02)

1. **VPN off** перед SSH на `192.168.1.103`.
2. Канон домена: **`kppdf-crm.ru`**.
3. Auth: login JSON = `{ access, refresh, user }` (FE хранит refresh).
4. Prod: сильный `ADMIN_PASSWORD` в `.env` (не demo-default) — иначе boot fail.
5. После wipe Mongo нужен **replica set rs0** (`mongo-init` в compose уже исправлен).
6. Не коммитить `config.env` / `CREDENTIALS.md`.

## Уроки вечернего деплоя (2026-08-02, post-wipe)

7. **Один деплой за раз.** Два параллельных `docker build --no-cache` на VM = зависание; на сервере не должно крутиться ничего лишнего кроме compose-стека kppdf (`kppdf-backend`, `kppdf-mongo`; `mongo-init` — one-shot Exited 0).
8. По умолчанию **кэшированный** `docker compose build backend` (минуты). Полный `--no-cache` — исключение.
9. После wipe/ротации JWT: краткий **401 на `/api/auth/me`** нормален (stale access) → refresh/re-login. Пароль только из `CREDENTIALS.md`.
10. **ИНН обязателен** для `POST /organizations`. Автосоздание «Основной организации» из шаблонов документов шлёт валидный ИНН `7707083893` (не убирать `@IsINN()`).
11. ValidationPipe должен кидать **`BadRequestException`** (400), не голый `Error` (иначе 500 на валидации).
12. **`TextBlockCategoriesSeed` обязан быть в `AppModule.providers`** + `TextBlockCategoryModule` в `imports`. Без этого: `Default text-block category unavailable` (slug `obshchee`). Seed сам чинит inactive/non-default system row.
13. DevFixturesSeed в `NODE_ENV=production` **не** создаёт demo-org — на проде org появляется через UI/шаблоны или admin.
14. Локальный LM Studio agent: `docs/agents/LM-STUDIO-AGENT.md`, trust **LIMITED_HELPER**, `pnpm lmstudio:check`.

### Smoke после деплоя

```powershell
curl.exe -sf http://192.168.1.103:3000/api/health/ready
# UI: https://kppdf-crm.ru/  — Ctrl+F5, login admin / CREDENTIALS.md
# Создать шаблон документа (пустое org → авто-org с ИНН)
# Создать текстовый блок без categoryId → должен взять «Общее» (obshchee)
```

### Если VM «мёртвая» (нет контейнеров, крутятся build)

```powershell
# с ПК (VPN off), один процесс:
$env:PYTHONUNBUFFERED='1'
python -u deploy/synology/deploy.py --skip-build   # если FE уже собран
# или полный: .\deploy\synology\deploy.ps1
```

На VM ожидаемо только: `kppdf-backend`, `kppdf-mongo` (+ exited `mongo-init`).