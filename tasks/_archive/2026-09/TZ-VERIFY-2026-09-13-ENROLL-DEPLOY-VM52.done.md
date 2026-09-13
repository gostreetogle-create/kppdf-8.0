# TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52: глобальная проверка enroll-fix + редеплой VM .52

ARCHIVE_MARKER
outcome: WARN
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (все измеримые без прямого SSH на VM) / 2 пункта WARN (нужен LAN/SSH)
  - typecheck: PASS (`tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`)
  - tests: PASS (123/123 suites, 851 passed + 7 skipped / 858, `enroll.page.spec.ts` включён)
  - lint: scoped 2 файла — 0 problems; full `nx lint kppdf-web` — 38 errors/259 warnings, точное
    совпадение с baseline, не чинилось (out of scope)
  - architecture:check: PASS
  - checklist: `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md` + evidence
  - status synchronization: PASS (`_NOW.md`, `STREAM-QUEUE.md` обновлены)

## Commits verified

- `9e1802fe72ab873a13eda299a1a30ce1390c038d` — fix(frontend): withComponentInputBinding
- `842275a5cc44510ed1f13d3620bf8253347bbe97` — docs(deploy): host `.103`→`.52` + DEPLOY-READY stamp

## Итог

Git-факты, локальные gates frontend-nx, публичная доступность бандла/статики/downloads,
health/ready, auth login и **ядро проверки — prod E2E enroll со свежим инвайтом** (пустая форма →
валидация без HTTP; заполненная `verify-<ts>` → `/api/device/enroll` успех → редирект на
`/admin/devices` → устройство active/owner-device/admin → revoked → 0 активных `verify-*`) —
все **PASS** с verbatim evidence.

**WARN, не FAIL:** исполнитель работал в сессии без сетевого маршрута к LAN 192.168.1.52
(`ssh` таймаутится даже без sandbox) — окружение, не дефект продукта/деплоя. Всё, что проходит
через публичный origin `https://kppdf-crm.ru`, проверено эквивалентно и подтверждено. Два
литеральных SSH-only пункта не закрыты: `systemctl is-active kppdf-tunnel` (косвенно подтверждён
рабочим health/ready через тот же туннель) и sha256-сверка секретов VM↔local config.env.

Successor: `tasks/_ready/TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md` (SIZE XS, только эти 2 пункта,
для окружения с реальным LAN-доступом).

Отдельный pre-existing successor (не создан этой VERIFY, уже был в репо):
`tasks/_ready/TZ-OPS-DOCS-HOST-52-SYNC.md` — stale `192.168.1.103` в `docs/ops/*` + cloudflared
legacy-строка в `CREDENTIALS.example.md`, подтверждено при проверке, не трогалось (не входит в
CONFLICT KEYS этой VERIFY).

## Files changed (эта VERIFY)

- `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md` (new)
- `docs/agent-checklists/evidence/VERIFY-2026-09-13-ENROLL-DEPLOY.txt` (new)
- `tasks/_ready/TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md` (new, successor)
- `docs/agent-checklists/_NOW.md`, `docs/agent-checklists/STREAM-QUEUE.md` (status sync)
- `tasks/_archive/2026-09/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.done.md` (this file)
