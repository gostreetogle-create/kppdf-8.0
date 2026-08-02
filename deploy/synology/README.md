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
| `.\deploy\synology\deploy.ps1 -SkipBuild` | Без пересборки Angular (только backend/архив) |

> **`-Wipe` только пока система не в реальной работе.** Когда PO скажет «работаем» — wipe запрещён.

---

## После клона репо

1. `pip install -r deploy/synology/requirements.txt`
2. Скопировать `config.env.example` → `config.env`, `CREDENTIALS.example.md` → `CREDENTIALS.md`, заполнить.
3. VPN off → `.\deploy\synology\deploy.ps1`

Деплой только с ПК в домашней сети (LAN к VM). **GitHub Actions / облачный CI не используем.**

---

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
