═══════════════════════════════════════════════════════════════
TZ-DEPLOY-301: Подготовка к первому staging/prod деплою (gate)
═══════════════════════════════════════════════════════════════

STATUS: READY — единственный «зелёный свет» перед `docker compose … up`
  на сервере. Пока этот TZ не в `_archive/*.done.md` — **не** считать
  проект готовым к спокойному диплою.
SOURCE: peer scan 2026-08-02 (env/auth/CORS/compose/deploy docs)
PAGES: n/a (ops) — smoke: /login, /materials, /orders, /inventory, /doc-constructor/templates
PAGE_DOCS: —

РОЛЬ АГЕНТА: Full-stack ops + auth contract (не product features)
ЗАВИСИМОСТИ: нет (можно параллельно с DOC/UX, но НЕ с Z-001 inventory tx
  если трогает тот же compose/deploy)
LAYER: 4 (backend auth/env) + 3 (FE auth tokens) + docs/deploy

CONFLICT KEYS:
backend/src/modules/auth/auth.service.ts;
backend/src/modules/auth/dto/auth-response.dto.ts;
backend/src/main.ts;
frontend/src/app/core/auth.service.ts;
frontend/src/app/core/auth.interceptor.ts;
docker-compose.prod.yml;
deploy/synology/deploy.py;
deploy/synology/DEPLOY.md;
deploy/synology/RUNBOOK.md;
deploy/synology/config.env.example;
docs/SECURITY-OPERATIONS.md;
docs/agent-checklists/TZ-DEPLOY-301.md;
.env.example;
backend/.env.example

═══════════════════════════════════════════════════════════════
ЗАЧЕМ ЭТОТ TZ (для PO)
═══════════════════════════════════════════════════════════════

На этой стадии продукт уже «достаточно страниц», чтобы выкатить
staging и проверить сервер. Не нужно ждать КП / People / Гант /
lifecycle-цепочку. Нужно закрыть **дыры, из‑за которых контейнер не
встанет, сессия отвалится через 15 мин, или CORS/секреты убьют boot**.

Когда TZ-DEPLOY-301 = DONE (архив) → можно спокойно деплоить по RUNBOOK.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано 2026-08-02)
═══════════════════════════════════════════════════════════════

BLOCKERS (обязательно закрыть):

1. **Auth refresh contract сломан между FE и BE**
   - BE login возвращает `{ access, user }` и пишет refresh в cookie
     `path: '/auth'` (`auth.service.ts` ~221–234) — cookie **не** матчит
     `/api/auth/*`.
   - FE ждёт `res.data.refresh` в body и кладёт в localStorage
     (`frontend/.../auth.service.ts` ~148); refresh шлёт Bearer.
   - Итог: access ~15m → silent refresh падает → пользователь на /login.
   - Решение (выбрать ОДНО, зафиксировать в AC):
     **A (рекомендуется для текущего FE):** login/refresh response
       включает `refresh` в JSON body (как FE уже умеет); cookie optional
       или удалить до отдельного HttpOnly-TZ.
     **B (правильный long-term):** cookie `path: '/api/auth'`,
       cookie-parser, FE `withCredentials`, убрать refresh из localStorage.

2. **Prod secret gate (TZ-248)**
   - `NODE_ENV=production` + слабый/placeholder secret → `process.exit(1)`.
   - `docker-compose.prod.yml` default
     `ADMIN_PASSWORD:-admin-change-me-immediately-in-production` —
     **banned** → backend не поднимется.
   - Нужны сильные `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥32, разные) и
     `ADMIN_PASSWORD` (≥12, не default) в host env / `config.env`
     (**не** коммитить).

3. **CORS_ORIGIN**
   - Выставить реальные HTTPS origins (канон домена один:
     `kppdf-crm.ru` *или* `sport-set.ru` — согласовать с DEPLOY.md).
   - Документы сейчас расходятся по домену.

4. **Frontend artifact**
   - Prod FE = `API_BASE_URL='/api'` (same-origin) — OK.
   - Перед up: `pnpm --dir frontend build` → файлы в том пути, который
     монтирует compose (`frontend/browser` / как в DEPLOY.md).
   - `deploy.py` зовёт `npm run build` — поправить на **pnpm** (STACK.md).

5. **Healthcheck**
   - Compose бьёт `/api/health` (mongo + RSS≤512MB + disk). Риск restart
     loop на маленькой VM. Для orchestration → `/api/health/ready`
     (mongo-only) *или* поднять лимит / оставить /health осознанно.

6. **Deploy docs hygiene**
   - В `DEPLOY.md` / `RUNBOOK.md` встречаются plaintext secrets / SSH —
     считать compromised; чистить из git, ротация на сервере.
   - Ссылки на отсутствующие `deploy-node.cjs` / `deploy.ps1` /
     `setup-tunnel-vm.sh` — убрать или восстановить один рабочий путь
     (`deploy.py` + compose).

NICE-TO-HAVE (не блокируют первый staging, отдельным списком в конце AC):

- `TRUST_PROXY=1` за nginx (один hop).
- Swagger off в prod (уже default).
- People / КП / Gantt / ACCESS page-ACL — **не** в этом TZ.
- Builder NG8113 warnings — не блокер boot.
- Mongo без auth на 127.0.0.1 — OK для LAN-only; не открывать наружу.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — Checklist `docs/agent-checklists/TZ-DEPLOY-301.md` до первой правки.

ШАГ 1 — Auth contract (выбрать A или B в Executor report).
  Исправить BE и/или FE так, чтобы после login:
  - access работает;
  - refresh после expiry access выдаёт новый access без ручного re-login;
  - jest/e2e auth smoke зелёный на выбранном контракте.

ШАГ 2 — Secrets / compose
  - Убрать insecure default `ADMIN_PASSWORD` из `docker-compose.prod.yml`
    (require env, fail-fast если пусто).
  - Обновить `.env.example` / `config.env.example`: placeholders явно
    «REPLACE», без copy-paste в prod.
  - Короткая секция в RUNBOOK: «сгенерировать 3 секрета → положить в
    host env → compose up».

ШАГ 3 — CORS + domain канон
  - Один канонический public origin в DEPLOY + compose comments.
  - `CORS_ORIGIN` (предпочтительно) задокументирован; `CORS_ORIGINS`
    alias упомянуть.

ШАГ 4 — Build + deploy script
  - `deploy.py` (или RUNBOOK): **pnpm** build frontend; путь artifact
    совпадает с volume.
  - Удалить/починить битые ссылки на missing scripts.

ШАГ 5 — Healthcheck
  - Compose healthcheck → `/api/health/ready` **или** документировать
    почему оставляем full `/api/health`.

ШАГ 6 — Docs scrub
  - Вырезать живые JWT/пароли/SSH из DEPLOY/RUNBOOK (→ CREDENTIALS.md
    gitignored only).
  - Pre-deploy checklist 10 строк в RUNBOOK.

ШАГ 7 — Local/prod-like smoke (минимум)
  - `NODE_ENV=production` boot с сильными секретами (docker или
    `start.mjs --prod`) → `/api/health/ready` 200.
  - Login → открыть /materials → подождать/форсировать refresh →
    остаёшься залогинен.
  - Открыть: /orders, /inventory, /doc-constructor/templates (без 5xx).

ШАГ 8 — Executor report (auto) + archive →
  `tasks/_archive/<YYYY-MM>/TZ-DEPLOY-301.done.md`.

НЕ ДЕЛАТЬ В ЭТОМ TZ:
- TZ-SALES-301 / People / Gantt / lifecycle ORDERS–ARCHIVE
- ACCESS-301/302 page ACL (можно деплоить без page-галочек)
- MATERIALS-307+ / DOC-325+ product features
- Push без явного «push» от PO

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ (DONE = можно деплоить)
═══════════════════════════════════════════════════════════════

1. Auth: login + refresh path работает end-to-end (вариант A или B
   зафиксирован в Executor report).
2. `docker-compose.prod.yml` не содержит banned default ADMIN_PASSWORD;
   boot с пустым/слабым секретом в production **падает явно**.
3. RUNBOOK содержит: secrets checklist, CORS origin, pnpm build path,
   `compose up`, health URL, first login.
4. DEPLOY/RUNBOOK без закоммиченных живых секретов.
5. Compose healthcheck согласован с §5.
6. Smoke §7 задокументирован (PASS) в checklist.
7. `## Executor report (auto)` заполнен; TZ в `_archive/…done.md`.

known_limitation:
- Первый деплой = staging smoke сервера, не «весь ERP готов».
- Product gaps (КП, People, Гант) остаются открытыми и **не** блокируют
  этот gate.
- HttpOnly-only refresh (вариант B) может уйти в successor TZ-DEPLOY-302
  если выбрали A.

ПРОМПТ исполнителю:
  Прочитай GEMINI.md + tasks/TZ-DEPLOY-301-prep-first-deploy.md.
  Checklist docs/agent-checklists/TZ-DEPLOY-301.md до правок.
  Push нет, пока PO не скажет.

После DONE — PO: «деплой можно» по `deploy/synology/RUNBOOK.md`.
