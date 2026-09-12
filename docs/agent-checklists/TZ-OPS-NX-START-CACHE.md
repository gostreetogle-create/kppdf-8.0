# TZ-OPS-NX-START-CACHE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-NX-START-CACHE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, конфликтов нет
- [x] TZ / audit / архив `TZ-OPS-NX-disable-interactive-nx-prompt.done.md` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-NX-START-CACHE.md` на месте

### Preflight Check Output
- **Context read:** `tasks/TZ-OPS-NX-START-CACHE.md`, `docs/audits/2026-09-12-nx-start-slow-ci-cache.md`, `scripts/start-launcher-helpers.mjs`, `scripts/start-launcher.test.mjs`, `tasks/_archive/2026-08/TZ-OPS-NX-disable-interactive-nx-prompt.done.md`
- **Key Constraints:** ops-only, не трогать product UI/BE; сохранить non-interactive Nx guard (ide.json + fail-fast prompt detection) без `CI=true`
- **Planned Deliverable:** `buildFrontendChildEnv(true)` без `CI`; обновить `formatNxPromptFailure` текст; обновить тест ожидание `CI === undefined` для nx; 2× cold start smoke
- **Validation Path:** `node --test scripts/start-launcher.test.mjs`; `node --check start.mjs`; smoke timings A/B

## Acceptance

- [x] `buildFrontendChildEnv(nxMode)` не ставит `CI` для nx
- [x] `scripts/start-launcher.test.mjs` обновлён под новое поведение, PASS
- [x] `node --check start.mjs` PASS
- [x] Smoke: 2× cold `node start.mjs --nx --no-browser` (A/B), нет `caching has been disabled`, нет зависания на Nx Console prompt

## Integrity slot

- [x] Тип изменения: other (ops launcher script)
- [x] FIC: N/A — ops script, не page/permission/module/MCP
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] COUPLING-MAP: N/A
- [x] DOCS-INTEGRITY канон учтён

## Gates (факт)

- `node --check start.mjs` → PASS
- `node --test scripts/start-launcher.test.mjs` → PASS (21/21)
- Cold A (`node start.mjs --nx --no-browser` после `--stop`): frontend готов за 24s, backend 51s, всего 57s; лог **без** `caching has been disabled` / prebundle warning
- Cold B (после `--stop` + повторный cold start): frontend готов за 22s, backend 47s, всего 53s; тоже без warning
- Нет зависания на «Install Nx Console?» prompt в обоих запусках

## Executor report

- `buildFrontendChildEnv(true)` больше не ставит `CI` — Angular persistent cache/prebundle остаются включены (default `environment: 'local'`, `!isCI`).
- Guard от Nx Console prompt остался тройным: `NX_SKIP_VSCODE_EXTENSION_INSTALL=true` + `ensureNxIdeNonInteractive()` (`~/.nx/ide.json`) + stream fail-fast (`isNxConsolePromptLine`/`containsNxConsolePrompt`) — `CI=true` был третьим, избыточным слоем именно для этого guard, но ценой отключал Angular cache.
- `formatNxPromptFailure` текст hint обновлён (убран упоминание `CI=true`).
- Тест `buildFrontendChildEnv` обновлён: `env.CI === undefined` для nx-режима.
- Smoke: warning `caching has been disabled` пропал в обоих cold-запусках; frontend ready time улучшился (24s→22s A→B) и ниже прежнего ~32s baseline из аудита.

## Closeout

- [x] archive + lock + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
