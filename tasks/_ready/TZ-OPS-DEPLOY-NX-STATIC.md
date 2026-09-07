# TZ-OPS-DEPLOY-NX-STATIC: prod static = NX kppdf-web

SIZE: S  
LAYER: 3  
РОЛЬ АГЕНТА: Ops / deploy pipeline (Claude executor)  
ЗАВИСИМОСТИ: Нет (блокер перед DEPLOY-READY NX)  
PAGES: N/A (ops)  
PAGE_DOCS: N/A  

CONFLICT KEYS: `deploy/synology/deploy.py` ; `deploy/synology/README.md` ; `deploy/synology/DEPLOY.md` ; `deploy/synology/RUNBOOK.md` ; `docs/agent-checklists/DEPLOY-READY.md` ; `docs/agent-checklists/PRE-DEPLOY-2026-09-07-NX.md` ; `docs/ops/DEPLOY-NX-PROD.md`

IMPLICIT CONFLICT: none on `kppdf-web/src/**` (только build path в deploy.py). Всё равно перед archive: `cd frontend-nx && pnpm exec nx build kppdf-web` green.

---

### Preflight Check Output

- **Context read:** `docs/ops/DEPLOY-NX-PROD.md`, `deploy/synology/deploy.py` (`build_frontend` ~406–439, `inject_desktop_download_url` ~349–372), `docker-compose.prod.yml` (FRONTEND_PATH), `frontend-nx/apps/kppdf-web/project.json`, `frontend-nx/apps/kppdf-web/src/app/app.config.ts` (`API_BASE_URL=/api`), `docs/ops/DANGEROUS-OPS.md`, `docs/agent-checklists/DEPLOY-READY.md`
- **Key Constraints:** Mode A уже зафиксировал канон; исполнитель только pipeline + docs stamp; **не** deploy.ps1 / **не** wipe / **не** SSH write на прод; Mongo default = warm
- **Planned Deliverable:** NX build → copy into `frontend/browser/`; README/RUNBOOK/DEPLOY sync; evidence PRE-DEPLOY; stamp READY
- **Validation Path:** `nx build kppdf-web` + полные BE/FE gates per `PROMPT-CLAUDE-DEPLOY-PREP-NX.md`; FIC N/A (ops)

Проверено: Counterparty/Organization N/A (ops-only).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Prod отдаёт статику из `frontend/browser/` (volume в `docker-compose.prod.yml`).
2. `deploy.py` `build_frontend()` собирает **legacy** `pnpm --dir frontend build` → `frontend/dist/kppdf-frontend/browser`.
3. TZD-71: inject desktop meta в NX dist **опционален**; NX ещё не ship’ится.
4. PO: следующий прод-сайт = **NX**. Данные: keep Mongo если совместимо (канон warm).

---

## ЧТО ДЕЛАТЬ

1. **Claim** в `tasks/_active/TZ-OPS-DEPLOY-NX-STATIC.md` + checklist Claim slot (`agent_id: claude`).
2. В `deploy.py` заменить `build_frontend`:
   - Команда: из `frontend-nx`: `pnpm exec nx build kppdf-web` (production defaultConfiguration уже production; timeout ≥900s).
   - Source of truth dist: `frontend-nx/dist/apps/kppdf-web/browser/index.html` must exist.
   - Очистить и скопировать **весь** browser tree → `frontend/browser/` (как сейчас для legacy).
   - Затем `publish_desktop_installer(...)` без смены контракта downloads/.
3. `inject_desktop_download_url`: после cutover **required** для артефакта, который уходит в прод (= `frontend/browser/index.html`, уже NX-содержимое). Зеркало в `frontend-nx/dist/...` можно оставить warn-optional или убрать дубль — не раздувать.
4. Логи/сообщения: «Building NX kppdf-web», не «Angular frontend (legacy)».
5. Синхронизировать тексты:
   - `deploy/synology/README.md` — блок «быстрый путь» + строка «prod static = NX»;
   - `DEPLOY.md` §9.2–9.3 и troubleshooting «Frontend пуст»;
   - `RUNBOOK.md` FE artifact step.
6. **Не** менять `docker-compose.prod.yml` mount (оставить `frontend/browser`).
7. Локально: `cd frontend-nx && pnpm exec nx build kppdf-web` → убедиться что copy path существует; опционально dry `python -c` не нужен.
8. Полные гейты + evidence → см. `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md` (этот TZ — часть prep, не отдельный mid-queue).
9. Обновить `DEPLOY-READY.md` → `READY`, поля ниже; `PRE-DEPLOY-2026-09-07-NX.md` заполнить результатами.
10. Commit+push **только** своих путей; archive TZ; **STOP — не** `deploy.ps1`.

### Поля штампа после успеха

```yaml
status: READY
frontend_target: nx
wipe_default: false
wipe_reason: "same Nest API; additive schemas since 4d55d0ea — keep Mongo/uploads"
deploy_sha_target: <full HEAD after this commit>
```

---

## ИЗМЕНЯТЬ

- `deploy/synology/deploy.py`
- `deploy/synology/README.md`, `DEPLOY.md`, `RUNBOOK.md` (только NX static statements)
- `docs/agent-checklists/DEPLOY-READY.md`, `PRE-DEPLOY-2026-09-07-NX.md`
- archive/checklist этого TZ

## НЕ ИЗМЕНЯТЬ

- `frontend/**` app code, `frontend-nx/apps/kppdf-web/src/**` (кроме если build сломан — тогда STOP + report)
- `backend/**` app logic
- `docker-compose.prod.yml` (mount path)
- nginx / VPS / tunnel
- `deploy.ps1 -Wipe`, любые SSH writes на VM/VPS
- секреты `config.env` / `CREDENTIALS.md`

---

## КРИТЕРИИ ПРИЁМКИ

1. `build_frontend` больше **не** вызывает `pnpm --dir frontend build`.
2. После локального `nx build kppdf-web` + логики copy: `frontend/browser/index.html` существует и содержит NX shell (не legacy title/kit если отличимы; минимум — файл из NX dist).
3. `pnpm --dir frontend build` **не** требуется для deploy path.
4. Docs README/DEPLOY/RUNBOOK говорят: prod static = NX → `frontend/browser/`.
5. Gates из `PROMPT-CLAUDE-DEPLOY-PREP-NX.md` зелёные или зафиксированы в §Debt штампа.
6. `DEPLOY-READY.status = READY` + `frontend_target: nx` + `wipe_default: false`.
7. Git: commit+push; TZ archived; **deploy.ps1 не запускался**.

## known_limitation

- Desktop zip: `accept-stale` ок, если нет свежего installer (web NX warm).
- Browser PO smoke на https — на шаге деплоя, не в этом TZ.
