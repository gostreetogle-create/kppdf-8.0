# TZ-OPS-NX-START-CACHE: вернуть Angular cache/prebundle при `start.mjs --nx`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: N/A (ops script, plain JS)
  - tests: PASS (`node --test scripts/start-launcher.test.mjs` 21/21)
  - lint: N/A (нет lint-таргета для root scripts/)
  - checklist: ADDED (`docs/agent-checklists/TZ-OPS-NX-START-CACHE.md`)
  - progress.md: N/A (ops-only, audit closeout вместо progress)
  - status synchronization: PASS (`_NOW.md`, WAVE, PO-SWEEP checklist обновлены)

## Root cause

`buildFrontendChildEnv(true)` ставил `CI: 'true'` ради non-interactive Nx Console
guard. Angular `@angular/build/src/utils/normalize-cache.js`: `environment` по
умолчанию `'local'` → `cacheEnabled = !isCI()`; при `CI=true` persistent
cache/prebundle отключались → каждый cold `nx serve` — полный rebuild.

## Fix

`scripts/start-launcher-helpers.mjs`: `buildFrontendChildEnv` больше не ставит
`CI` для nx-режима. Guard от «Install Nx Console?» prompt остался тройным без
`CI`: `NX_SKIP_VSCODE_EXTENSION_INSTALL=true` + `ensureNxIdeNonInteractive()`
(`~/.nx/ide.json` `auto_install_console: false`) + stream fail-fast
(`isNxConsolePromptLine` / `containsNxConsolePrompt`). Fallback (ШАГ 4,
`cli.cache.environment` в `frontend-nx/angular.json`) не понадобился — prompt
не вернулся.

`scripts/start-launcher.test.mjs`: `buildFrontendChildEnv(true)` тест ожидает
`env.CI === undefined`. `formatNxPromptFailure` hint text обновлён (убран
`CI=true`).

## Smoke (2× cold start)

| Run | frontend ready | backend ready | total | warning caching/prebundle |
|-----|-----------------|-----------------|-------|------------------------------|
| A (`--nx --no-browser` после `--stop`) | 24s | 51s | 57s | отсутствует |
| B (повторный cold после `--stop`) | 22s | 47s | 53s | отсутствует |

Baseline до фикса (аудит 2026-09-12): frontend ~32s + warning. Нет зависания на
«Install Nx Console?» ни в одном из запусков.

## Gates

| Gate | Result |
|------|--------|
| `node --check start.mjs` | PASS |
| `node --test scripts/start-launcher.test.mjs` | PASS (21/21) |
| Cold A smoke | PASS (no warning, 24s) |
| Cold B smoke | PASS (no warning, 22s) |

## Files changed

- `scripts/start-launcher-helpers.mjs`
- `scripts/start-launcher.test.mjs`
- `docs/audits/2026-09-12-nx-start-slow-ci-cache.md` (closeout)
- `docs/agent-checklists/TZ-OPS-NX-START-CACHE.md` (checklist, new)
