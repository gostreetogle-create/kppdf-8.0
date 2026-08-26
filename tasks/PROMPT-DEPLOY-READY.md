# PROMPT — подготовка к деплою (не для PO-копипаста)

> **PO не обязан открывать этот файл.**  
> PO говорит Cursor: **«подготовь к деплою»**. Cursor/умный агент следует чек-листу ниже.  
> Потом PO любому ИИ: **«сделай деплой по документации»** → тот читает только  
> `deploy/synology/README.md` (верхний блок) + штамп `DEPLOY-READY.md`.
>
> Постмортем: `docs/audits/2026-08-23-deploy-block-desk423-stale-specs.md`.

---

## Задача агента подготовки

Привести репо к `docs/agent-checklists/DEPLOY-READY.md` → `status: READY`.  
Прод **не** трогать (не `deploy.ps1` / не SSH-запись / не wipe).

```text
CLAIM (agent_id, claimed_at ISO, workspace D:\kppdf-8.0).

0. Если DEPLOY-READY уже READY и HEAD == deploy_sha_target → «уже готово», STOP.

1. SYNC: git fetch; main == origin/main; дерево чистое.
   Чужой IN WORK с пересечением ключей → STOP.

2. ПОЛНЫЕ ГЕЙТЫ на HEAD (не focused):
   frontend/backend tsc; frontend && pnpm test; backend && pnpm test; architecture:check
   Красный вне §Базлайн → чини мини-TZ + все зависимые specs, потом гейты снова.
   Красный из §Базлайн → в known_debt штампа, не чини молча.

3. SPEC-COVERAGE с прошлого prod/ready SHA:
   git diff --name-only <sha>..HEAD -- product .ts
   → rg зависимые *.spec.ts → прогон/обновление.

4. ГИГИЕНА:
   a) _active XOR _archive (+ sha: в done.md)
   b) смешанный коммит (одна SHA = две TZ) → HARD STOP штампа;
      waive только явной фразой PO
   c) синхронизируй верх README: путь к штампу и шаги «деплой по документации»
      совпадают с фактическим READY

5. DESKTOP: zip vs последний коммит desktop/ → спроси PO пересобрать или accept-stale;
   ответ в штамп (desktop_zip).

6. Evidence: PRE-DEPLOY-<date>.md с deploy_sha_target = полный HEAD; §F пуст.
   Preflight.ps1 OK; VPN off; SSH 192.168.1.103:22.

7. Перепиши DEPLOY-READY.md → READY + поля sha/date/agent/debt/desktop/mixed.
   Коммит+push docs. Отчёт: «Deploy-Ready на <sha>. Можно: сделай деплой по документации.»
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
