# Audit — медленный `node start.mjs --nx` (2026-09-12)

## Симптом

Лог: frontend ~32s до ready; warning:
`Prebundling has been configured but will not be used because caching has been disabled.`

Backend compile ~11s (нормально). Health-poll «ждём backend/frontend 28s» — параллельный wait, не отдельный баг.

## Root cause

`scripts/start-launcher-helpers.mjs` → `buildFrontendChildEnv(true)` ставит **`CI: 'true'`** (ради non-interactive Nx / isTTY).

Angular `@angular/build` `normalize-cache.js`:
- default `environment = 'local'` → `cacheEnabled = !isCI`
- при `CI=true` **persistent cache выключен** → **prebundle не работает** → каждый cold `nx serve` полный rebuild (~13s bundle в логе).

Исторически после TZ-OPS-NX-disable-interactive: frontend ready ~6s (warm/reuse или меньший app). Сейчас app крупнее (lazy chunks UX sweep) + **всегда cold без cache** → ощущение «стало дольше».

## Не причина

- NG8102 studio-table `??` — warning, не slowdown.
- Backend DEP0190 — deprecation, не health.
- `NX_DAEMON: false` — осознанно (Windows PID); вторичный вклад.

## Fix (предпочтительно)

1. Убрать `CI: 'true'` из nx child env; оставить `NX_INTERACTIVE=false`, `NX_SKIP_VSCODE_EXTENSION_INSTALL=true`, `~/.nx/ide.json`, fail-fast на Nx Console prompt.
2. Fallback если prompt вернётся: не возвращать `CI=true`; вместо этого workspace `cli.cache.environment: "all"` (только если без CI нельзя).
3. AC: warning prebundle/cache **пропал**; 2× cold `node start.mjs --nx --no-browser` с `--stop` между — 2-й frontend значительно быстрее 1-го (cache hit); тесты `start-launcher.test.mjs`.

## Не трогать

Product pages; BE; `NX_DAEMON: false` без отдельной причины.

## Closeout (2026-09-12)

`TZ-OPS-NX-START-CACHE` DONE — `CI: 'true'` убран из `buildFrontendChildEnv(nxMode)`;
guard от Nx Console prompt остался на `NX_SKIP_VSCODE_EXTENSION_INSTALL` +
`ensureNxIdeNonInteractive` + stream fail-fast (без fallback `cli.cache.environment`
понадобился — prompt не вернулся). 2× cold `--nx --no-browser`: без warning
`caching has been disabled`, frontend 24s → 22s (было ~32s+warning). Архив:
`tasks/_archive/2026-09/TZ-OPS-NX-START-CACHE.done.md`.
