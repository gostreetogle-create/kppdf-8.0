# TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52: глобальная проверка работ 2026-09-13 (enroll-fix + редеплой VM .52)

> **SIZE:** L · **PACK:** single (verification wave)
> **РОЛЬ АГЕНТА:** QA-валидатор / Ops-verificator (read-only по продукту; пишет только отчёт)
> **LAYER:** 3 (read-only; НЕ запускать параллельно с редакторскими TZ на `kppdf-web/src/**` → см. BUILD INTEGRITY)
> **ЗАВИСИМОСТИ:** деплой уже выполнен и подтверждён (origin/main `9e1802fe` + `842275a5`; прод VM 192.168.1.52). Перед этим TZ — он **сразу после** этих работ, PATCH-уровень следующих TZ — см. known_limitation.

**CONFLICT KEYS:** (read-only scope, не редактировать)
`frontend-nx/apps/kppdf-web/src/app/pages/enroll/; frontend-nx/apps/kppdf-web/src/app/app.config.ts; deploy/synology/README.md; deploy/synology/INSTALL.md; deploy/synology/DEPLOY.md; deploy/synology/RUNBOOK.md; deploy/synology/deploy.py; deploy/synology/config.env.example; deploy/synology/CREDENTIALS.example.md; docs/agent-checklists/DEPLOY-READY.md`

**PAGES:** `/enroll/:token` ; `/admin/devices`
**PAGE_DOCS:** `docs/pages/enroll.page.md` ; `docs/pages/admin-devices.page.md`

---

## Domain preflight

- **Канон имён:** сущность устройства = `Device` (`backend/src/modules/device-enrollment/`, коллекция devices в Mongo). Инвайты: `kind: owner-device | regular`, TTL `DEVICE_OWNER_INVITE_TTL_MINUTES` (прод default **2880** = 48 ч). «Проверено:» пути ниже в ИСХОДНОЕ — все реально открыты в сессии 2026-09-13; schema/data-model сверены с ответами API.
- **Necessity:** PO запросил сквозную проверку сегодняшних работ (баг записи устройства в браузере + редеплой + обновление схемы доступа) — verification TZ, продукт не меняет.
- **Проверено (источники правды объектов проверки):**
  `frontend-nx/apps/kppdf-web/src/app/app.config.ts; frontend-nx/apps/kppdf-web/src/app/app.routes.ts; frontend-nx/apps/kppdf-web/src/app/pages/enroll/enroll.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/enroll/enroll.page.spec.ts; frontend-nx/apps/kppdf-web/project.json; backend/src/modules/device-enrollment/*; deploy/synology/deploy.py; docs/ops/DEPLOY-NX-PROD.md; docs/agent-checklists/DEPLOY-READY.md; deploy/synology/CREDENTIALS.md|config.env (локальные, gitignored)`

---

## ИСХОДНОЕ СОСТОЯНИЕ (факты для сверки, не «общие слова»)

1. **Баг (корень):** `frontend-nx/apps/kppdf-web/src/app/app.config.ts` бутстрапил `provideRouter(appRoutes)` **без** `withComponentInputBinding()`. `enroll.page.ts` объявляет `readonly token = input.required<string>();` — параметр роута `:token` (роут `enroll/:token` в `app.routes.ts`) не связывался с input → доступ `this.token()` бросал NG0957 синхронно внутри `try {}` в `onSubmit`, ловился `catch {}` и показывался как generic «Не удалось подключить компьютер. Попробуйте ещё раз.» (POST `/api/device/enroll` вообще не уходил; консоль пустая). Воспроизводился в чистом headless Chromium (не кэш).
2. **Фикс (коммит `9e1802fe72ab873a13eda299a1a30ce1390c038d`, on origin/main):** `app.config.ts` → `import { provideRouter, withComponentInputBinding }` + `provideRouter(appRoutes, withComponentInputBinding())` (строка ~23). Новый регресс-тест `frontend-nx/apps/kppdf-web/src/app/pages/enroll/enroll.page.spec.ts`: хост `<router-outlet/>`, провайдеры `provideRouter([{ path: 'enroll/:token', component: EnrollPage }], withComponentInputBinding())`, моки `PiDeviceEnrollmentService.enroll` и `AuthService`; проверяет, что при URL `/enroll/<SECRET>` вызывается `enroll(SECRET, '<deviceName>')` и применяется `applyDeviceAccess`.
3. **Доки+штамп (коммит `842275a5cc44510ed1f13d3620bf8253347bbe97`, on origin/main):** `deploy/synology/{README,INSTALL,DEPLOY,RUNBOOK}.md`, `config.env.example`, `CREDENTIALS.example.md`, `deploy.py` — канонический host VM сменился `192.168.1.103 → 192.168.1.52`; `docs/agent-checklists/DEPLOY-READY.md` → `why_invalid: deployed 9e1802fe 2026-09-13 ...`.
4. **Прод после редеплоя (deploy.py warm, 2026-09-12T23:40 UTC, VM 192.168.1.52, KEY `%USERPROFILE%\.ssh\kppdf80-vm`, user `tiit`, sudo-пароль только в `deploy/synology/CREDENTIALS.md`):**
   - бандл на VM: `main-TCTUXZXK.js`, `polyfills-7R4CRVNH.js`, `styles-JX5ZI4Q6.css` (старый был `main-L7C4BQ2J.js`);
   - static = volume `./frontend/browser:/app/frontend:ro` (контейнер `kppdf-backend`, docker-compose.prod.yml в `/opt/kppdf-8.0/`); data `/var/lib/kppdf80/` (mongodb, uploads, media, backups);
   - `https://kppdf-crm.ru/` = device-гейт (403-страница); `/enroll/…`, `/legal/`, статика — публичны; nginx `kppdf-proxy` → `127.0.0.1:4200` (туннель `kppdf-tunnel`, VM→VPS 193.222.62.240; VPS — только через VM-jump);
   - `GET /api/health/ready` → `{"status":"ok","info":{"mongo":{"status":"up"}},…}` (VM-localhost и через публичный origin);
   - прод-E2E подтверждён (session 2026-09-13): POST `/api/device/enroll` → **200**, редирект на `/admin/devices`, устройство отображено; тестовые устройства `pw-test` (id `6aa5e39cbc1dc47f3460f677`) и `domtiit-test` (`6aa5dff4ed26afa68d54a9d8`) — **оба revoked** на момент написания TZ, активных тестовых устройств нет.
5. **Локальные gates на момент закрытия фикса:** `nx build kppdf-web` exit 0; `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` OK; тесты **123 suite PASS** (вкл. `enroll.page.spec.ts`); scoped `eslint` на 2 файлах фикса — 0 проблем; полный lint приложения — **38 errors / 259 warnings предсуществующие** (gantt/studio/shipping и др., к фиксу отношения не имеют; зафиксировать как baseline без новых файлов).
6. **Инвайты/секреты:** `deploy/synology/config.env` (gitignored): `DEPLOY_HOST=192.168.1.52`, `PLATFORM=ubuntu`, `WIPE=false`, `CORS_ORIGIN=https://kppdf-crm.ru`, `KPPDF_DATA_DIR=/var/lib/kppdf80`, `DEPLOY_SSH_KEY` = локальный ключ; ADMIN_PASSWORD/JWT в `config.env` и на VM в `/opt/kppdf-8.0/.env`.

---

## ЧТО ДЕЛАТЬ

**ШАГ 1 — Git-факты (read-only).**
1.1 `git fetch origin main`; `git status --short` → в рабочей копии НЕ должно быть изменений в `app.config.ts`/`enroll.page.spec.ts` (и любых product-файлах сегодняшних коммитов); посторонние изменения (PO-CANON, STREAM-QUEUE, untracked data/*, prompt_cannon/ и пр.) — перечислить как наблюдение, НЕ откатывать.
1.2 `git --no-pager show --stat 9e1802fe72ab873a13eda299a1a30ce1390c038d` → ровно 2 файла (app.config.ts + enroll.page.spec.ts), 78 insertions/2 deletions; `git --no-pager show --stat 842275a5cc44510ed1f13d3620bf8253347bbe97` → ровно 8 файлов docs/deploy.
1.3 `git merge-base --is-ancestor 9e1802fe HEAD` и то же для `842275a5` → exit 0; `origin/main` == локальный HEAD (ff-синхронизировано).

**ШАГ 2 — Локальные gates зоны frontend-nx (базовые, без правок).**
2.1 Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (бандл `main-TCTUXZXK.js` в `dist/apps/kppdf-web/browser/`).
2.2 `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → 0 ошибок.
2.3 `pnpm test -- --runInBand` (полный прогон) → все suite PASS, в выводе есть `enroll.page.spec.ts` (минимум 1 failing = FAIL).
2.4 Scoped eslint: `pnpm exec eslint apps/kppdf-web/src/app/pages/enroll/enroll.page.spec.ts apps/kppdf-web/src/app/app.config.ts` → 0 проблем.
2.5 `pnpm architecture:check` (корень репо) → exit 0. Полный lint НЕ чинить — только сверить, что список ошибок тот же baseline (38/259), новых файлов нет.

**ШАГ 3 — Прод: бандл и статика на VM (read-only).**
3.1 `ssh -i ~/.ssh/kppdf80-vm tiit@192.168.1.52 "curl -s http://localhost:3000/ | rg -o 'main-[A-Za-z0-9]+\.js|polyfills-[A-Za-z0-9]+\.js|styles-[A-Za-z0-9]+\.css'"` → содержит ровно `main-TCTUXZXK.js`, `polyfills-7R4CRVNH.js`, `styles-JX5ZI4Q6.css` (другие имена main-* = FAIL).
3.2 В том же index.html должен быть `<meta name="kppdf-desktop-download-url"` (CSP-safe, без inline-script).
3.3 `ls /opt/kppdf-8.0/frontend/browser/downloads/` (через ssh) → есть `kppdf-desktop-setup-v0.5.10.zip`, `kppdf-desktop-setup-v0.5.10.exe`, `kppdf-desktop-setup.zip`, `kppdf-desktop-setup.exe`.
3.4 Публичный origin: `https://kppdf-crm.ru/enroll/несуществующий_секрет` и корень `/` — открываются без 5xx; корень отдаёт device-гейт (не SPA-страницу логина без инфраструктуры).

**ШАГ 4 — Прод: backend-здоровье, туннель, auth.**
4.1 `curl -sf http://localhost:3000/api/health/ready` (VM) и `curl -sf https://kppdf-crm.ru/api/health/ready` (локально) → оба `"status":"ok"` + `mongo.up`.
4.2 `systemctl is-active kppdf-tunnel` (VM) → `active`.
4.3 Auth: на VM из `/opt/kppdf-8.0/.env` взять `ADMIN_PASSWORD` (НЕ печатать), `POST /api/auth/login` `{"username":"admin","password":$PW}` → в ответе есть `access` и `refresh` (ни токены, ни пароль в artifacts/лог не писать).

**ШАГ 5 — Prod E2E записи устройства (ядро проверки; свежий инвайт).**
5.1 Выпустить НОВЫЙ owner-инвайт (не переиспользовать URL из чата): на VM скрипт `login → Bearer токен → POST /api/admin/devices/owner-invite` с `{"password":$PW}` (шаблон: логин из п.4.3; тело из `.env`; все секреты остаются на VM). Результат — `url` вида `https://kppdf-crm.ru/enroll/<secret>`, `kind: owner-device`, TTL ≈ 48 ч.
5.2 Playwright/головной браузер (скрипт `C:\Users\User\AppData\Local\Temp\opencode\enroll_pw.py` как референс, но URL подставить свежий из 5.1), события `request`/`requestfailed`/`console`/`pageerror`:
   - пустая отправка → вал.ошибка «Введите имя компьютера.» (никакого `/api/device/enroll`);
   - заполнить уникальное имя `verify-<unixtime>` → **ожидаем**: `request POST /api/device/enroll` → `response 200`, редирект `URL_FINAL == https://kppdf-crm.ru/admin/devices`, консоль/pageerror пустые; отсутствие POST или status ≠ 200 или requestfailed = **FAIL**.
5.3 По `GET /api/admin/devices` (Bearer) — новое устройство `status: active`, `inviteKind: owner-device`, `role: admin`; затем **отозвать** через `POST /api/admin/devices/<id>/revoke`, итоговый список — без активных записей `verify-*` (сверка как в session: после revoke `status: revoked`). Инвайт из 5.1 после консьюма использовать безвозвратно (спалить).

**ШАГ 6 — Схема доступа и консистентность доков.**
6.1 `rg -n "192\.168\.1\.103" deploy/synology docs/agent-checklists/DEPLOY-READY.md` → **0 совпадений** в живых операц. доках (файлы из CONFLICT KEYS). Исторические аудиты/архивы с .103 — допустимы (не изменять).
6.2 `DEPLOY-READY.md` → `deployed 9e1802fe ...` в `why_invalid`; `frontend_target: nx`; `wipe_default: false`.
6.3 `config.env` (локальный): `DEPLOY_HOST=192.168.1.52`, `WIPE=false`. Сверка секретов: на VM сравнить hash `ADMIN_PASSWORD`/`JWT_SECRET`/`JWT_REFRESH_SECRET` из `/opt/kppdf-8.0/.env` с локальными `config.env` (sha256, без вывода значений); расхождение = WARN-факт в отчёт (не ротировать без PO).

**ШАГ 7 — Артефакты проверки и финализация.**
7.1 Завести checklist `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md` (шаблон `docs/agent-checklists/_TEMPLATE.md` позаимствовать заголовком, но это read-only TZ): статус по каждому AC (PASS/FAIL/WARN), зафиксировать evidence-команды. Вербатим-выводы (>30 строк суммарно) — в `docs/agent-checklists/evidence/VERIFY-2026-09-13-ENROLL-DEPLOY.txt` и сослаться путём (кап § из skill tz-authoring: status/decision секции ≤15 строк, evidence ≤30 строк, длинное — в evidence/).
7.2 Если обнаружен НЕБАЛЕНД-дефект — **не чинить**: завести successor-TZ в `tasks/_ready/`/`tasks/_backlog/` с конфликт-ключами и известным обходом; в отчёте deadline-факт.
7.3 Финал: вердикт PASS/FAIL по сводной матрице + `## Executor report (auto)` в checklist (поле commit(s): 40-символьные SHA, суммы не нужны). Эта TZ сама НЕ запускает деплой; если всё PASS — обновить `DEPLOY-READY.md` штамп НЕ требуется (уже актуален) — только если найден рассинхрон и это санкционировано (в противном случае отметить WARN в отчёте).

---

## ФАЙЛЫ

**ИЗМЕНЯТЬ (только отчётные артефакты, без product-кода):**
- `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md` — создать (checklist + вердикт + Executor report)
- `docs/agent-checklists/evidence/VERIFY-2026-09-13-ENROLL-DEPLOY.txt` — создать (raw evidence)

**НЕ ИЗМЕНЯТЬ:**
- `frontend-nx/apps/kppdf-web/src/**` и любые product-файлы (app.config.ts, enroll.*, routes, @kppdf/*) — запрещено; баг = successor-TZ
- `backend/src/**` — запрещено
- `deploy/synology/CREDENTIALS.md`, `config.env` — секреты, локальные, не в git; никакие значения/пароли/токены в артефакты и чат не выводить
- `docs/PO-CANON.md`, `docs/agent-checklists/STREAM-QUEUE.md`, untracked `data/*`, `prompt_cannon/`, `Soup-*.zip` — чужие/третьи правки
- `_templates/*`, `OrchestratorKit/*` — служебные
- Исторические аудиты/архивы с упоминанием 192.168.1.103 — не подчищать (исторический факт)

---

## КРИТЕРИИ ПРИЁМКИ (все — измеримо; провал любого = FAIL/блокер контекста)

1. `origin/main` содержит `9e1802fe…` и `842275a5…`; `git merge-base --is-ancestor` обоих → 0; `git status` не показывает изменений в файлах этих коммитов.
2. `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0; `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → 0 ошибок; полный `pnpm test` → все suite PASS, включая `enroll.page.spec.ts`; scoped eslint 2 файлов → 0; `pnpm architecture:check` → exit 0.
3. VM-serve index.html выдаёт `main-TCTUXZXK.js` (не `main-L7C4BQ2J.js`) + `polyfills-7R4CRVNH.js` + `styles-JX5ZI4Q6.css`; meta `kppdf-desktop-download-url` присутствует; `downloads/` содержит versioned `kppdf-desktop-setup-v0.5.10.{zip,exe}` + aliases.
4. `/api/health/ready` OK (VM-localhost и `https://kppdf-crm.ru/…`); `kppdf-tunnel` active; admin login возвращает `access`+`refresh`.
5. **E2E enroll (свежий инвайт):** пустая форма → «Введите имя компьютера.» (без HTTP-запроса); заполненная (`verify-<ts>`) → **POST `/api/device/enroll` 200**, редирект на `/admin/devices`, устройство active (owner-device/admin), затем revoked; в финальном списке `api/admin/devices` нет активных `verify-*`.
6. `rg "192\.168\.1\.103" deploy/synology docs/agent-checklists/DEPLOY-READY.md` → 0 в живых доках; `DEPLOY-READY` говорит `deployed 9e1802fe`; `config.env` → `DEPLOY_HOST=192.168.1.52`, `WIPE=false`.
7. Секреты в артефактах/отчёте отсутствуют (grep пароля/токенов по checklist/evidence файлам → 0).
8. Checklist создан с матрицей PASS/FAIL/WARN по всем пунктам + `Executor report (auto)`; evidence >30 строк вынесен в `evidence/` файл.

**Ручная проверка (PO, после вердикта PASS):** открыть готовую owner-ссылку из п.5.1 во «втором» браузере, ввести имя своего ПК → попасть на `/admin/devices` с устройством в списке (это «чистая» проверка пользовательского сценария; выполняется ПО, не агентом).

---

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие — продукт НЕ меняется; nx build ПОСЛЕДНИМ как контроль регрессий):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test
  pnpm architecture:check
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**; эта TZ read-only, но параллельный редакторского характера agent на kppdf-web недопустим.

---

## Finalization (root TZ)

1. Вердикт + evidence → checklist `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md` + `evidence/*.txt`.
2. `git add` только 2 отчётных файла → коммит `docs(verify): 2026-09-13 enroll+deploy full verification <PASS|FAIL>` → push (pre-push typecheck прогонит сам хук).
3. Копию эталона проверки — `tasks/_archive/2026-09/` (краткое резюме + SHA), массив-факт в `tasks/TZ-INVENTORY-ACTIVE.md` не требуется (verification не выдавалась в continuous).
4. Промпт исполнителя: `GEMINI.md` + `tasks/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.md`; CLAIM первым (agent_id + claimed_at ISO + workspace; conflict-check по CONFLICT KEYS чужого `_active`; при пересечении — STOP).

---

## known_limitation

- Проверка НЕ покрывает: desktop-пару, мобильные layout-страницы, нагрузку, резервное копирование/восстановление, ротацию секретов. Это отдельные аудиты.
- Обнаруженный новый баг — НЕ чинить здесь: successor-TZ + WARN в отчёте.
- Инвайт из п.5.1 сжигается консьюмом E2E — ссылку для PO перевыпускает следующий executor/PO (не переиспользовать протухшие URL).
- Разъяснение для PO: «запись ПК» = Device (owner/regular), отметка времени исправления — prod-деплой `9e1802fe`, проверен 2026-09-13.