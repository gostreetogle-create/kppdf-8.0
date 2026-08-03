# KPPDF 8.0 — Runbook (краткий чеклист)

> **Старт здесь:** [`README.md`](./README.md)  
> **Архитектура:** [`DEPLOY.md`](./DEPLOY.md)  
> **Секреты:** [`CREDENTIALS.md`](./CREDENTIALS.md) (gitignore)  
> Обновлено: 2026-08-02 (TZ-DEPLOY-301)

---

## Архитектура

```
https://kppdf-crm.ru → VPS nginx (443) → localhost:4200
                                              ↑
                    autossh reverse tunnel (VM→VPS)
                                              │
                    VM 192.168.1.103 (Synology Ubuntu)
                      └─ Docker: kppdf-backend:3000
                      └─ Docker: kppdf-mongo (4.4, rs0)
```

Канон домена: **`kppdf-crm.ru`**.  
`CORS_ORIGIN` (предпочтительно) = `https://kppdf-crm.ru`. Alias `CORS_ORIGINS` — legacy, тот же comma-separated список.

---

## Секреты (сгенерировать → host env / config.env)

Не коммитить. Только `config.env` (gitignored) + `CREDENTIALS.md` (gitignored).

```powershell
# 3 секрета (PowerShell):
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })   # JWT_SECRET
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })   # JWT_REFRESH_SECRET (другой!)
# ADMIN_PASSWORD: ≥12 символов, НЕ admin-change-me-immediately-in-production
```

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # JWT_REFRESH_SECRET
```

Положить в `deploy/synology/config.env` → `deploy.py` пишет `/opt/kppdf-8.0/.env` → `docker compose up`.

---

## Pre-deploy checklist (10 строк)

1. **VPN OFF** — иначе LAN `192.168.1.103` часто недоступен.
2. `config.env` + `CREDENTIALS.md` скопированы из `*.example` и заполнены.
3. `JWT_SECRET` ≠ `JWT_REFRESH_SECRET`, оба ≥32; `ADMIN_PASSWORD` ≥12, не demo-default.
4. `CORS_ORIGIN=https://kppdf-crm.ru` (канон).
5. SSH: `DEPLOY_SSH_KEY` (предпочтительно) или `DEPLOY_PASSWORD`.
6. `WIPE=false` после первой чистой установки (не сносить живые данные).
7. FE artifact: `pnpm --dir frontend build` → `frontend/browser/` (делает `deploy.py`).
8. Compose health URL: `/api/health/ready`.
9. Первый логин: `admin` + пароль из CREDENTIALS (не admin123).
10. После up: smoke `/login`, `/materials`, `/orders`, `/inventory`, `/doc-constructor/templates`.

---

## Деплой одной командой

```powershell
# VPN OFF, из корня репо:
.\deploy\synology\deploy.ps1              # обычный update
.\deploy\synology\deploy.ps1 -Seed        # + bootstrap restart
.\deploy\synology\deploy.ps1 -Wipe -Seed  # ТОЛЬКО чистая переустановка
```

```bash
./deploy/synology/deploy.sh
./deploy/synology/deploy.sh --seed
```

Под капотом: `deploy.py` (pnpm build → SSH → docker compose → health/login).

Первый раз на ПК: см. [`README.md`](./README.md) § «Первый раз».

---

## Быстрая проверка

```text
https://kppdf-crm.ru/
https://kppdf-crm.ru/api/health/ready
```

```powershell
ssh -i $env:USERPROFILE\.ssh\kppdf80-vm tiit@192.168.1.103 "sudo docker ps"
curl http://192.168.1.103:3000/api/health/ready
```

Логин: `admin` + пароль из **CREDENTIALS.md** (не admin123).

### Stabilization Wave smoke (TZ-PROC-301)

```text
VPN OFF
1. GET /api/health/ready → ok
2. Login admin (CREDENTIALS.md)
3. Templates → Создать → A4 → builder opens
4. Add one text block → save (no category unavailable)
5. Texts: create block without categoryId → default «Общее»
6. Only one deploy at a time; docker ps = kppdf-backend + kppdf-mongo
```

Канон волны: [`docs/STABILIZATION-WAVE-2026-08.md`](../../docs/STABILIZATION-WAVE-2026-08.md).

---

## Типичные проблемы

| Симптом | Что сделать |
|---------|-------------|
| Ping/SSH VM timeout | Выключить VPN |
| Сайт без CSS + CSP `script-src-attr` | Уже починено в BE/FE; Ctrl+F5. Не должно повторяться |
| Login 401 | Неверный пароль **или** softlock (~15 мин после 5 ошибок). Верный пароль в CREDENTIALS; либо `python deploy/synology/reset-admin-password.py` |
| `/api/auth/me` 401 сразу после деплоя | Stale access после ротации JWT — refresh / re-login (Ctrl+F5) |
| `Default text-block category unavailable` | Seed `TextBlockCategoriesSeed` (slug `obshchee`) не в AppModule или категория inactive — см. README §уроки вечера |
| `POST /organizations` 500 «INN must be…» | Клиент не прислал ИНН; validation должна быть 400. Шаблоны: авто-org с `7707083893` |
| Два `docker build --no-cache` / VM «мёртвая» | Убить лишние build, один деплой с кэшем; на VM только kppdf compose |
| 502 на домене | Tunnel: на VPS `ss -tlnp \| grep :4200`; на VM `sudo systemctl restart kppdf-tunnel` |
| Backend unhealthy / mongo timeout | `rs.status()` на mongo; compose `mongo-init` должен поднять rs0 |
| Compose «не поднял» контейнеры | Смотри `deploy.py` docker шаг; не должно быть bare `build` вне `$DC` |
| Access expire → /login | Auth variant A: refresh JWT в JSON body. Если всё ещё падает — смотри softlock / секреты |

Деплой-канон и быстрый путь: [`README.md`](./README.md) (§флаги + уроки вечера).  
LM Studio local helper: [`docs/agents/LM-STUDIO-AGENT.md`](../../docs/agents/LM-STUDIO-AGENT.md).

---

## Бэкап MongoDB

```bash
ssh tiit@192.168.1.103
cd /opt/kppdf-8.0 && sudo bash backup.sh
# → /var/lib/kppdf80/backups/...
```

> Когда начнёте **реальную работу** — wipe/удаление данных запрещены без явного указания PO.

---

## Источники

- [`README.md`](./README.md) — one-command
- [`DEPLOY.md`](./DEPLOY.md) — архитектура
- [`deploy.py`](./deploy.py) — реализация
- [`reset-admin-password.py`](./reset-admin-password.py) — сброс admin (`--password` ≥12)
