# Deploy NX → production (канон cutover)

> Цель UI на проде = **`frontend-nx` / `kppdf-web`**, не legacy `frontend/`.  
> Инфра (VPS nginx → tunnel → VM `:3000` + Mongo) **без смены**.  
> Точка входа деплоя: [`deploy/synology/README.md`](../../deploy/synology/README.md).  
> Опасные ops: [`DANGEROUS-OPS.md`](./DANGEROUS-OPS.md).

## 1. Что меняется при NX-cutover

| Было (legacy) | Станет (NX) |
|---------------|-------------|
| `pnpm --dir frontend build` | `cd frontend-nx && pnpm exec nx build kppdf-web` |
| Dist: `frontend/dist/kppdf-frontend/browser` | Dist: `frontend-nx/dist/apps/kppdf-web/browser` |
| Staging ship: `frontend/browser/` | **Тот же** `frontend/browser/` (docker mount без смены) |

`docker-compose.prod.yml` остаётся:

```yaml
./frontend/browser:/app/frontend:ro
FRONTEND_PATH: /app/frontend
```

API в NX: `API_BASE_URL = '/api'` (same-origin через nginx) — отдельно CORS не трогать.

## 2. Данные Mongo (решение PO 2026-09-07)

| Условие | Действие |
|---------|----------|
| Стек = тот же Nest backend + те же коллекции; схемы аддитивны с последнего prod | **Warm** (`WIPE=false`) — Mongo и uploads **не** стирать |
| Health/login падают из‑за несовместимой схемы / миграции; или явный запрос «чистый сайт» | **Wipe только после бэкапа** + фраза PO: `да, разрешаю wipe после бэкапа` |

**Канон по умолчанию для следующего NX-деплоя: WARM.**  
Последний prod warm: `4d55d0ea` (2026-08-27). С тех пор BE — поля Supply/Warehouse/Photos/Studio/Contract и т.п.; ломающих drop-коллекций в cutover нет → wipe **не** планировать заранее.

Перед wipe всегда: `cd /opt/kppdf-8.0 && sudo bash backup.sh` → путь бэкапа PO по-русски.

## 3. Двухшаговый процесс (не смешивать)

1. **Подготовка** (не деплой): TZ `TZ-OPS-DEPLOY-NX-STATIC` + полные гейты + штамп  
   [`DEPLOY-READY.md`](../agent-checklists/DEPLOY-READY.md) = `READY`, `frontend_target: nx`.  
   Промпт: `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md`.
2. **Деплой:** PO любому агенту — «сделай деплой по документации» → только блок в  
   `deploy/synology/README.md` + штамп READY. **Без** jest/tsc, **без** правок кода.

## 4. Smoke после NX warm

1. `https://kppdf-crm.ru/api/health/ready` → ok + mongo up  
2. Логин admin (пароль из `CREDENTIALS.md`, в чат не писать)  
3. UI = NX shell (не legacy): `/desk` или `/orders`, `/registries`, `/studio` список  
4. Нет TS overlay; статика/хеши грузятся (DevTools Network)  
5. Desktop download meta (если zip staged) — опционально accept-stale

## 5. Запреты

- Не деплоить NX, пока `DEPLOY-READY.status != READY` или `frontend_target != nx`.
- Не `-Wipe` без русской фразы PO после бэкапа.
- Не менять nginx/tunnel/DNS в app-деплое.
- Не коммитить `config.env` / `CREDENTIALS.md`.
