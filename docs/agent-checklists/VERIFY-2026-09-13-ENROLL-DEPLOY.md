# VERIFY-2026-09-13-ENROLL-DEPLOY checklist

> Status: **DONE (verdict: WARN)**
> Marker: `tasks/_active/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.md` (removed after archive)
> TZ: `tasks/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.md`
> Evidence: `docs/agent-checklists/evidence/VERIFY-2026-09-13-ENROLL-DEPLOY.txt`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T08:14:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI session, no team-room MCP configured)

## Preflight

- [x] git status/branch/worktree list проверены — `tasks/_active/` был пуст, конфликтов по CONFLICT KEYS нет
- [x] TZ / desk-audit прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.md` был на месте на время работы

## ENV NOTE (важно для интерпретации результатов)

Эта executor-сессия **не имеет сетевого маршрута к LAN 192.168.1.52** — прямой
`ssh tiit@192.168.1.52` таймаутится (порт 22), с sandbox и без него. Публичный origin
`https://kppdf-crm.ru` доступен полностью. Все VM-внутренние проверки ниже выполнены через
эквивалентный публичный путь (device-gated static + admin API, с локальными credentials из
gitignored `deploy/synology/config.env`) — это даёт то же фактическое покрытие для всего, что
проходит через публичный домен, но не закрывает два литеральных SSH-only пункта (см. WARN ниже
и successor `tasks/_ready/TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md`).

## Acceptance matrix

| # | AC | Результат |
|---|----|-----------|
| 1 | Git-факты: `9e1802fe`/`842275a5` ancestors HEAD, ровно те файлы, чистота product-файлов | **PASS** |
| 2 | Локальные gates frontend-nx: build/tsc/test(123 suites)/scoped eslint/architecture:check + full-lint baseline | **PASS** |
| 3 | VM serve bundle hashes + meta + downloads/ (4 файла) | **PASS** (через публичный origin, не литеральный `ssh...localhost:3000`/`ls`) |
| 4 | health/ready (публично) + auth login (access+refresh) | **PASS** (публично) · tunnel `systemctl`/VM-localhost health — **не выполнено литерально** (см. WARN) |
| 5 | Prod E2E enroll (свежий инвайт, ядро проверки) | **PASS** |
| 6 | Доки/схема доступа: `.103` отсутствует в живых конфликт-файлах, DEPLOY-READY корректен, `config.env` корректен | **PASS** · sha256-сверка секретов VM↔local — **не выполнено** (SSH недоступен) |
| 7 | Секреты отсутствуют в артефактах/чеклисте (grep по паролю/токенам/JWT/инвайт-секрету → 0) | **PASS** |
| 8 | Checklist + evidence оформлены, verbatim >30 строк вынесен в evidence/ | **PASS** |

**Дополнительно проверено (WARN, не блокер VERIFY, из PROMPT-файла п.7):**
- stale `192.168.1.103` в `docs/ops/home-host-access.md`, `PROMPT-ACCESS-METHOD-DEBATE.md`,
  `RUNBOOK-CLEAN-SYNLOGY-KP3-LOAD.md` — подтверждено, найдено. Successor
  `tasks/_ready/TZ-OPS-DOCS-HOST-52-SYNC.md` уже существует в репо (создан не этой VERIFY),
  уже в `STREAM-QUEUE.md` pack #7 — не трогать в этой VERIFY.
- cloudflared legacy-строка в `deploy/synology/CREDENTIALS.example.md:70` — подтверждено, тот же successor.

## Gates (факт)

См. `docs/agent-checklists/evidence/VERIFY-2026-09-13-ENROLL-DEPLOY.txt` — verbatim вывод всех команд
(git show/merge-base, nx build, tsc, jest, eslint, architecture:check, full lint baseline, curl/Playwright
E2E, grep-и).

Кратко:
- `nx build kppdf-web` → exit 0, бандл `main-TCTUXZXK.js`/`polyfills-7R4CRVNH.js`/`styles-JX5ZI4Q6.css`
- `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `pnpm test -- --runInBand` → **123/123 suites PASS**, 851 passed + 7 skipped / 858 tests, `enroll.page.spec.ts` включён
- scoped `eslint` (2 файла фикса) → 0 problems
- `pnpm architecture:check` → PASS (1487 files; baseline 17, resolved since baseline: 2)
- full `nx lint kppdf-web` → 38 errors / 259 warnings — **точное совпадение** с задокументированным baseline, новых файлов нет
- E2E: пустая форма → валидационная ошибка без HTTP; заполненная `verify-<ts>` → редирект на `/admin/devices`,
  устройство `active`/`owner-device`/`admin` подтверждено через `GET /api/admin/devices`, затем revoked;
  финальный список — 0 активных `verify-*`. Тестовые инвайты и устройства уничтожены (2 цикла: второй понадобился
  только чтобы дочитать `downloads/` с бОльшим таймаутом после обрыва по размеру файла в первом прогоне).

## Executor report (auto)

**Вердикт: WARN** (не PASS, не FAIL).

Что сделано: полный прогон TZ ШАГ 1-7. Все критерии, измеримые без прямого SSH на VM (git-факты,
локальные gates frontend-nx, публичная доступность бандла/статики/downloads, health/ready, auth
login, **ядро проверки — prod E2E enroll со свежим инвайтом**, консистентность доков/config.env,
отсутствие секретов в артефактах) — **PASS**, с полным verbatim evidence.

Почему не PASS целиком: эта сессия не имеет сетевого маршрута к внутренней LAN 192.168.1.52
(`ssh` таймаутится даже без sandbox-ограничений) — окружение, а не дефект продукта или деплоя.
Ровно два литеральных пункта TZ, которые *требуют* shell на VM, не выполнены:
- п.4.2 `systemctl is-active kppdf-tunnel` (косвенно подтверждено — публичный домен проксирует
  через этот же туннель и отвечает `health/ready` 200 — но литеральная команда не запускалась);
- п.6.3 sha256-сверка `ADMIN_PASSWORD`/`JWT_SECRET`/`JWT_REFRESH_SECRET` VM↔local (нужен VM-shell).

Successor заведён: `tasks/_ready/TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md` (SIZE XS, только эти
два пункта, для сессии/окружения с реальным доступом к LAN .52).

Conflict disclosure: параллельно репо содержит 14 активных `.worktrees/TZ-NX-DOCSTUDIO-S27..S40`
(отдельные ветки, не в `tasks/_active/` основного дерева) — эта VERIFY их не трогала, работала
только в основном workspace `D:\kppdf-8.0`, read-only по продукту.

Известные пред-существующие наблюдения (не новые дефекты, не чинить):
- `https://kppdf-crm.ru/` отдаёт `401` на device-гейте; TZ-текст говорит "403-страница" — тот же
  разнобой уже зафиксирован в desk-аудите (`docs/audits/2026-09-13-fresh-vm52-rebuild.md`) как
  дозволенный факт, не 5xx, функционально верно.
- Рабочая копия имеет посторонние изменения (`docs/PO-CANON.md`, `docs/agent-checklists/STREAM-QUEUE.md`,
  untracked `data/*`, `prompt_cannon/`, `Soup-*.zip`, несколько чужих `tasks/*`/`docs/audits/*`,
  `docs/peer/*`) — не откатывались, не относятся к этой VERIFY (правило TZ п.1.1).

Commit(s) verified:
- `9e1802fe72ab873a13eda299a1a30ce1390c038d` — enroll fix (`withComponentInputBinding` + regression spec)
- `842275a5cc44510ed1f13d3620bf8253347bbe97` — deploy docs host `.103`→`.52` + `DEPLOY-READY` stamp

closed_at: 2026-09-13T09:10:00Z
