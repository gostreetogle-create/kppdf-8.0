═══════════════════════════════════════════════════════════════
TZ-OPS-301: Quiet local boot logs (Nest DI spam)
═══════════════════════════════════════════════════════════════

> READY · LAYER 4 · ops / DX · **review before archive**
>
> PO (2026-08-08): при `start:all` консоль снова «простыня» —
> `InstanceLoader` / `NestFactory` / vite `ECONNREFUSED` до готовности бэка.
> Нужно **минимально нужное** при старте, без потери полезных WARN.
>
> Проверено: `backend/src/main.ts` (`NestFactory.create` + `bufferLogs`,
> Bootstrap URL/health); `backend/src/app.module.ts` (`LoggerModule` /
> `LOG_LEVEL` default `info`); `backend/.env.example` (`LOG_LEVEL=debug`);
> `start.mjs` (passthrough без `--tail`; TUI `--tail` уже тихий);
> `tasks/_archive/2026-07/TZ-44.md.done` (DEP0190 / shell — не дублировать).

STATUS: DONE — archive `tasks/_archive/2026-08/TZ-OPS-301.done.md` · `f12c2d8`

РОЛЬ АГЕНТА: Backend / DevOps (Nest bootstrap + start orchestrator)

ЗАВИСИМОСТИ: Нет

LAYER: 4

PAGES: (нет — DX / console)
PAGE_DOCS: (нет)

CONFLICT KEYS:
backend/src/main.ts;
backend/src/app.module.ts;
backend/src/common/logging/quiet-nest-logger.ts;
backend/.env.example;
start.mjs;
docs/agent-checklists/TZ-OPS-301.md;
docs/agent-checklists/_active-map.md;
progress.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Nest boot печатает INFO на каждый модуль (`DatabaseModule dependencies
   initialized` …) через pino после `app.useLogger(PinoLogger)`.

2. Полезное, которое **нельзя** глушить:
   - TZ-248 weak-secret WARN (`INSECURE_ADMIN_*`);
   - Bootstrap финал: URL / Swagger / Health;
   - seed / migration WARN|ERROR;
   - любые ERROR.

3. Оркестратор: без `--tail` — полный passthrough stdout; с `--tail` —
   3 строки статуса (уже ок). Frontend до health бэка сыпет
   `http proxy error … ECONNREFUSED`.

4. `.env.example` сейчас `LOG_LEVEL=debug` — усиливает шум, не канон для
   локального комфорта.

5. `main.ts` может иметь локальный dirty (CORS desktop origins) — **не
   откатывать**, аккуратно влить quiet-логи рядом.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Фильтр Nest DI-шума (канон quiet boot)

В dev/test (не production) приглушить INFO/LOG только от Nest DI-контекстов:

- `InstanceLoader`
- `RoutesResolver`
- `RouterExplorer`
- `NestFactory` (строка «Starting Nest application…»)

Рекомендация реализации (одна из двух, выбрать проще без новых deps):

**A (предпочтительно):** тонкий `LoggerService` / wrapper над pino
(`quiet-nest-logger.ts` или рядом с `main.ts`), который дропает
`log`/`verbose`/`debug` если `context ∈ NOISE_SET`, а `warn`/`error`/
`fatal` всегда пропускает. Подключить через `NestFactory.create({
bufferLogs: true, logger: … })` и/или после `app.useLogger(...)`.

**B:** `NestFactory.create({ logger: false })` + явный `useLogger` —
только если гарантированно не теряются Bootstrap/seed WARN; иначе A.

Escape hatch (обязателен):

- `NEST_BOOT_VERBOSE=1` **или** `LOG_LEVEL=debug` → полный Nest DI dump
  как сейчас.

Production: поведение не ухудшать (фильтр можно оставить — DI-спам там
тоже не нужен; JSON/pino transport без pretty).

ШАГ 2: `.env.example`

- `LOG_LEVEL=info` (не `debug`).
- Комментарий: `debug` / `NEST_BOOT_VERBOSE=1` = подробный boot;
  default = quiet DI.

ШАГ 3: `start.mjs` — подавить race proxy (узко)

Пока `state.services.backend.status !== 'ready'`, в passthrough/TUI
**не** печатать строки frontend, которые одновременно содержат
`http proxy error` и `ECONNREFUSED` (или AggregateError от proxy на `/api`).

После `backend === ready` — снова показывать любые proxy ошибки.

Не трогать другие vite/frontend логи. Не менять health-wait логику.

ШАГ 4: Docs / checklist / progress

- Checklist `docs/agent-checklists/TZ-OPS-301.md` до кода.
- Одна строка в `progress.md`.
- `_active-map`: OPS-301 DONE / NEXT по факту.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `backend/src/main.ts` — подключить quiet logger / verbose flag
- `backend/src/common/logging/quiet-nest-logger.ts` — NEW (если вариант A)
- `backend/src/app.module.ts` — только если нужен hook к LoggerModule
  (иначе не трогать)
- `backend/.env.example` — LOG_LEVEL=info + комментарий
- `start.mjs` — filter proxy ECONNREFUSED pre-ready
- checklist / progress / active-map

НЕ ИЗМЕНЯТЬ:
- HTTP `pinoHttp.autoLogging` / access-log политику (отдельный TZ при
  жалобе на шум **во время** работы, не boot)
- TZ-248 secret validation (WARN остаются)
- frontend Angular / vite config (кроме косвенно через start filter)
- DEP0190 / spawn shell (TZ-44 зона; не «чинить» заново)
- Чужой dirty: desktop icons, frontend pages chrome, TZD-* MCP WIP —
  **не stage**
- Не откатывать CORS desktop origins в `main.ts`, если уже есть

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Холодный `node start.mjs` (или `start:all`) без `--tail`: в потоке
   `[backend]` **нет** строк `dependencies initialized` /
   `InstanceLoader` / `Starting Nest application…`.

2. Есть (или эквивалент): Bootstrap started + Health/Swagger URL;
   при коротком admin password — WARN TZ-248.

3. `NEST_BOOT_VERBOSE=1` (или `LOG_LEVEL=debug`) возвращает DI-спам.

4. До готовности бэка: нет спама vite `proxy error` + `ECONNREFUSED`;
   после ready — proxy ошибки (если есть) снова видны.

5. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   node --check start.mjs
   ```
   Опц.: короткий ручной cold start ≤30s и скрин/копия 15–40 строк лога
   в checklist evidence.

6. Commit **только** conflict keys TZ-OPS-301 (+ CORS hunk в main.ts
   если неотделим). Не `git add .`.

7. Archive только после Cursor/PO PASS + `## Executor report (auto)`.

known_limitation:
- HTTP request INFO от pino-http при работе UI — вне scope.
- `start:tail` уже тихий — не ломать TUI.
- Полный silence Node DEP0190 из чужих child-process путей — вне scope
  (если всплывёт снова — successor, не раздувать этот TZ).

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md + checklist · archive `tasks/_archive/2026-08/TZ-OPS-301.done.md`
после PASS · lock `.mimocode/locks/` по принятому канону ops.
