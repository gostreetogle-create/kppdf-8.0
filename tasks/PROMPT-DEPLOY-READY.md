# PROMPT — подготовка к деплою (не для PO-копипаста)

> **PO не обязан открывать этот файл.**  
> PO говорит Cursor: **«подготовь к деплою»**. Cursor/умный агент следует чек-листу ниже.  
> Потом PO любому ИИ: **«сделай деплой по документации»** → тот читает только  
> `deploy/synology/README.md` (верхний блок) + штамп `DEPLOY-READY.md`.
>
> Постмортем: `docs/audits/2026-08-23-deploy-block-desk423-stale-specs.md`.

---

## Задача агента подготовки

Привести репо к `docs/agent-checklists/DEPLOY-READY.md` → `status: READY`  
**и** `frontend_target: nx` (канон `docs/ops/DEPLOY-NX-PROD.md`).  
Прод **не** трогать (не `deploy.ps1` / не SSH-запись / не wipe).

**NX-волна (актуально 2026-09-07):** используй `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md`  
+ `tasks/_ready/TZ-OPS-DEPLOY-NX-STATIC.md` (переключить `deploy.py` на NX build).  
Этот файл — общий каркас гейтов.

```text
CLAIM (agent_id, claimed_at ISO, workspace D:\kppdf-8.0).

0. Если DEPLOY-READY уже READY + frontend_target=nx и HEAD == deploy_sha_target → «уже готово», STOP.
   Если READY но frontend_target отсутствует/legacy → продолжай NX prep.

1. SYNC: git fetch; main == origin/main; дерево чистое.
   Чужой IN WORK с пересечением ключей → STOP.

2. NX static path: TZ-OPS-DEPLOY-NX-STATIC closed (deploy.py → nx build kppdf-web → frontend/browser/).

3. ПОЛНЫЕ ГЕЙТЫ на HEAD (не focused):
   frontend/backend tsc; frontend && pnpm test; backend && pnpm test; architecture:check;
   cd frontend-nx && pnpm exec nx build kppdf-web
   Красный вне §Базлайн → чини мини-TZ + все зависимые specs, потом гейты снова.
   Красный из §Базлайн → в known_debt штампа, не чини молча.

4. SPEC-COVERAGE с прошлого prod/ready SHA:
   git diff --name-only <sha>..HEAD -- product .ts
   → rg зависимые *.spec.ts → прогон/обновление.

5. ГИГИЕНА:
   a) _active XOR _archive (+ sha: в done.md)
   b) смешанный коммит (одна SHA = две TZ) → HARD STOP штампа;
      waive только явной фразой PO
   c) синхронизируй верх README: путь к штампу и шаги «деплой по документации»
      совпадают с фактическим READY; frontend_target=nx

6. DESKTOP: zip vs последний коммит desktop/ → спроси PO пересобрать или accept-stale;
   ответ в штамп (desktop_zip).

7. ДАННЫЕ: wipe_default=false если схемы совместимы (канон NX warm). Wipe не ставить в штамп
   без эскалации PO.

8. Evidence: PRE-DEPLOY-*-NX.md с deploy_sha_target = полный HEAD; §F пуст.
   Preflight.ps1 — на машине деплоя (VPN off); prep может отметить «deferred to deploy agent».

9. Перепиши DEPLOY-READY.md → READY + frontend_target/nx + wipe_default + sha/date/agent/debt/desktop/mixed.
   Коммит+push docs. Отчёт: «Deploy-Ready NX на <sha>. Можно: сделай деплой по документации.»
   STOP.
```

### §Базлайн (обновлять на каждом прогоне)

```text
Проверено на: 631f96e0  date: 2026-08-26T06:20:00+03:00
backend/src/modules/catalog/catalog-314.archive.spec.ts:79
backend/src/modules/admin/users-admin.controller.spec.ts:114
FE suites (debt): proposal-create-terms; orders.page / order-detail;
  material-form-dialog; proposal-workspace
architecture: 2× fe-page-cross-component (materials/products dialogs)
categories.page.spec: PASS (TZ-TEST-422 done)
```

---

## Деплой после READY

Не этот файл. Агент читает **`deploy/synology/README.md`** → блок  
«Если PO сказал: сделай деплой по документации».
