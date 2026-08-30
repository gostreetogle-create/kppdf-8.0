# TZ-OPS-NX-disable-interactive-nx-prompt — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-executor-ops-nx-prompt

## Root cause

Nx **21.4.0** `ensureNxConsoleInstalled()` вызывает enquirer prompt
`Install Nx Console?` без проверки piped stdio (fix только в nx ≥21.5).
`CI=1` недостаточно для `params.isTTY()` (ожидает `CI=true`).

## Changes

### `scripts/start-launcher-helpers.mjs`
- `NX_SKIP_VSCODE_EXTENSION_INSTALL=true`, `CI=true` в `buildFrontendChildEnv(true)`.
- `ensureNxIdeNonInteractive()` → `~/.nx/ide.json` `auto_install_console: false`.
- `isNxConsolePromptLine` / `containsNxConsolePrompt` / `formatNxPromptFailure`.

### `start.mjs`
- Вызов `ensureNxIdeNonInteractive()` перед nx spawn.
- Fail-fast: при prompt в stdout/stderr → kill frontend + `exit(1)`.

### `scripts/start-launcher.test.mjs`
- +6 tests (21 total).

## Gates

| Gate | Result |
|------|--------|
| `node --check start.mjs` | PASS |
| `node --test scripts/start-fast-path.test.mjs` | PASS (10/10) |
| `node --test scripts/start-launcher.test.mjs` | PASS (21/21) |
| `pnpm exec nx build kppdf-web` | PASS |
| `pnpm exec nx run-many -t lint --all` | PASS |
| `pnpm run architecture:check:nx` | PASS |
| `pnpm run ui:tokens:nx` | PASS |

## Two launches

| Run | Result | Timing |
|-----|--------|--------|
| 1 | Ready, no Nx Console prompt | frontend 6s · backend 14s · total 15s |
| 2 | Ready, ide.json already set | frontend 6s · backend 15s · total 21s |

## Executor report

Triple guard: env (`NX_SKIP_VSCODE_EXTENSION_INSTALL`, `CI=true`), ide prefs, stream fail-fast. Healthy :4201 reuse and legacy start preserved.
