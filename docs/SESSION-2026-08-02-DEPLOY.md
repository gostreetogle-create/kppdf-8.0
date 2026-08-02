# Session closeout — 2026-08-02 (evening)

Краткий указатель «как у нас работает» после первого prod-деплоя и вечерних фиксов.
Подробности — в связанных файлах; этот файл — карта.

## Prod stack

| Что | Где |
|-----|-----|
| UI / API | `https://kppdf-crm.ru` → tunnel → VM `192.168.1.103:3000` |
| Deploy | `deploy/synology/README.md` + `deploy.ps1` / `deploy.py` |
| Runbook | `deploy/synology/RUNBOOK.md` |
| Secrets | `deploy/synology/config.env` + `CREDENTIALS.md` (**не в git**) |
| Data on VM | `/var/lib/kppdf80/` (mongo, uploads, backups) |
| App on VM | `/opt/kppdf-8.0/` |

На VM в норме только compose kppdf: `kppdf-backend`, `kppdf-mongo` (+ `mongo-init` Exited 0).

## Deploy flow (fast path)

1. VPN **OFF**
2. Локально: Angular → `frontend/browser/`
3. Tar: backend sources + browser + compose
4. SSH upload → `docker compose build backend` **(cache)** → `up -d`
5. Smoke: `/api/health/ready` + login из CREDENTIALS

Не гонять два деплоя сразу. `--no-cache` — редко.

## Bugs fixed this evening

| Issue | Fix |
|-------|-----|
| Nest DI: `RoleService` missing in AuthModule | `AuthModule` imports `RoleModule` |
| Templates auto-org → 500 INN | FE sends valid INN `7707083893`; ValidationPipe → 400 |
| Text-block default category missing | Wire `TextBlockCategoriesSeed` + `TextBlockCategoryModule` in AppModule |
| Dual hung `--no-cache` builds | Kill extras; default cached build in `deploy.py` |

## Local LM Studio (optional)

- Docs: `docs/agents/LM-STUDIO-AGENT.md`
- Runner: `pnpm lmstudio:check` / `pnpm lmstudio -- --task "..."`
- Trust: **LIMITED_HELPER** (draft only; not security review / archive / deploy)

## Tomorrow checklist

1. `git pull` на рабочей машине
2. VPN off → открыть `https://kppdf-crm.ru` (Ctrl+F5)
3. Login `admin` / `CREDENTIALS.md`
4. Smoke: materials, doc templates (create), text blocks
5. Обычный update: `.\deploy\synology\deploy.ps1` (без `-Wipe`)
