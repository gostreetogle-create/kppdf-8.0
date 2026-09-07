# TZ-OPS-DEPLOY-NX-STATIC — DONE

- **agent_id:** claude
- **implementation_sha:** pending (filled at closeout)
- **TZ:** tasks/_ready/TZ-OPS-DEPLOY-NX-STATIC.md
- **Prompt:** tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md
- **Canon:** docs/ops/DEPLOY-NX-PROD.md

## Что сделано

- **`deploy/synology/deploy.py` — `build_frontend()` переключён на NX:**
  - Было: `subprocess.run(["pnpm", "--dir", "frontend", "build"], ...)` → source `frontend/dist/kppdf-frontend/browser`.
  - Стало: `subprocess.run(["pnpm", "exec", "nx", "build", "kppdf-web"], cwd=frontend-nx, timeout=900)` → source `frontend-nx/dist/apps/kppdf-web/browser`.
  - Copy-логика в `frontend/browser/` не изменилась (rmtree + copytree/copy2 всего browser-дерева).
  - `publish_desktop_installer(...)` вызывается без изменений контракта downloads/.
  - Логи: «Building NX kppdf-web...» вместо «Building Angular frontend...»; `Step 2/8` в `main()` тоже переименован.
  - `inject_desktop_download_url`: обязательная инъекция в `frontend/browser/index.html` (теперь NX-контент) оставлена как есть; зеркало в `frontend-nx/dist/.../index.html` осталось warn-optional (docstring обновлён — это уже не «TZD-71 mirror для будущего», а рабочий second-copy).
  - Комментарий "Angular assets folder" → "NX assets folder" (единственная строка в файле, где ещё упоминался Angular).
  - `docker-compose.prod.yml` mount **не тронут** (остаётся `frontend/browser:/app/frontend:ro`).
- **Docs sync (только NX-static формулировки, без переписывания остального):**
  - `deploy/synology/README.md` — «быстрый путь» п.1: «NX собирается `deploy.py`» + «TZ-OPS-DEPLOY-NX-STATIC закрыт».
  - `deploy/synology/DEPLOY.md` §9 preamble (деплой разрешён по документации при READY+nx); §9.3 п.1 (nx build kppdf-web, cutover завершён); Troubleshooting #7 (Frontend пуст → nx build + copy из nx dist); §14 «Frontend dist» строка (nx dist path).
  - `deploy/synology/RUNBOOK.md` — Pre-deploy checklist п.8 (FE artifact = nx build kppdf-web).

## Данные (Mongo)

`wipe_default: false` (warm) — тот же Nest API; аддитивные схемы с последнего prod `4d55d0ea` (Supply/Warehouse/Photos/Studio/Contract поля и т.п.), breaking migration не найдена. Wipe не планируется; эскалация только по явной фразе PO после бэкапа (канон `docs/ops/DANGEROUS-OPS.md`).

## Desktop

`publish_desktop_installer` при локальном прогоне `build_frontend()` нашёл и опубликовал **свежий** `v0.5.10` installer (`frontend/downloads/kppdf-desktop-setup-v0.5.10.exe`, оставшийся от TZD-78 `release-installer`) — не stale. `accept-stale` остаётся каноном на случай будущего дрейфа версии.

## Gates (все зелёные, полный список см. `docs/agent-checklists/PRE-DEPLOY-2026-09-07-NX.md`)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit → clean
cd backend && pnpm test → 130 suites / 1257 tests PASS
cd backend && pnpm lint → 0 errors, 198 warnings (pre-existing no-explicit-any baseline)
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit → clean
cd frontend && pnpm test → 196 suites / 2091 tests PASS
cd frontend && pnpm lint → 0 errors, 17 warnings (pre-existing no-implements-oninit-in-pages baseline) + UI token check PASS
pnpm architecture:check → PASS (1465 files; baseline 17; resolved since baseline: 2)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (2 pre-existing baseline warnings, unrelated files)
```

Плюс локальная сквозная проверка copy-пути (не гейт из списка, но AC TZ п.2/7): прямой вызов
`deploy.build_frontend(project_root)` из Python — `frontend/browser/index.html` подтверждённо
NX-контент (байт-в-байт идентичен `frontend-nx/dist/apps/kppdf-web/browser/index.html`, маркер
`kppdf-web` внутри, не legacy Angular title).

## АС чек (из TZ)

1. `build_frontend` больше не вызывает `pnpm --dir frontend build` ✔ (grep по `deploy.py` — 0 вхождений)
2. После локального `nx build kppdf-web` + copy: `frontend/browser/index.html` существует, NX-контент ✔
3. `pnpm --dir frontend build` не требуется для deploy path ✔
4. Docs README/DEPLOY/RUNBOOK говорят: prod static = NX → `frontend/browser/` ✔
5. Gates зелёные ✔ (см. таблицу в evidence)
6. `DEPLOY-READY.status = READY` + `frontend_target: nx` + `wipe_default: false` ✔
7. Git: commit+push; TZ archived; **deploy.ps1 не запускался** ✔

## known_limitation

- Desktop zip: оказался свежим (не stale) — лучше базового ожидания TZ, ничего дополнительного не потребовалось.
- Живой browser smoke на https — задача шага деплоя (`docs/ops/DEPLOY-NX-PROD.md` §4), не этого TZ.
- `preflight.ps1` SSH-проба — задача агента деплоя (VPN off), вне scope подготовки.

## НЕ тронуто

`docker-compose.prod.yml` mount; nginx/VPS/tunnel; `backend/**` app logic; `frontend/**`/`frontend-nx/apps/kppdf-web/src/**` app code; секреты `config.env`/`CREDENTIALS.md`; `deploy.ps1 -Wipe`; никакой SSH-запись на VM/VPS; `deploy.ps1` не запускался.
