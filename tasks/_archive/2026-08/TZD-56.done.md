# TZD-56: Desktop AI — NSIS sidecar / bundled ai-runner

> Successor TZD-55. Wave WAVE-DESKTOP-IA-SHELL.
>
> РОЛЬ: Desktop packaging (`bundle-ai-runner.mjs`, `aiRunner.ts`, tauri resources).
>
> ЗАВИСИМОСТИ: TZD-55 DONE.

LAYER: 3

CONFLICT KEYS: `desktop/src/core/aiRunner.ts` ; `desktop/scripts/bundle-ai-runner.mjs` ;
`desktop/src-tauri/**` ; `desktop/docs/INSTALL.md` ; `docs/FEATURE-INTEGRATION-CHECKLIST.md`

CHECKLIST: `docs/agent-checklists/TZD-56.md`

---

## Что сделано

1. **Option B:** Vite SSR bundle `src/ai-runner/index.ts` → `src-tauri/resources/ai-runner/ai-runner.mjs` (без `tsx`). `node-llama-cpp` + CPU `@node-llama-cpp/win-x64` копируются nested из pnpm graph (CUDA/Vulkan skip).
2. **`aiRunner.ts`:** `resolveAiLaunchPlan` — dev (`src`+`tsx`) побеждает leftover resource; NSIS без src → bundled `.mjs`. Env `KPPDF_AI_RUNNER_DIR` может указывать на sidecar-папку с `.mjs`.
3. **Tauri 0.5.6:** `bundle.resources`, `$RESOURCE` fs scope, `windows/hooks.nsh` (`taskkill /T` Desktop перед update).
4. **Dev** `tauri dev` не вызывает bundler (`beforeDevCommand` = `pnpm dev`).
5. Import/Form Studio не трогались. Deploy/wipe не выполнялись.

## Verification

- `cd desktop && npx tsc --noEmit` → **0**
- `npx svelte-check --threshold error` → **0/0**
- `npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → **72/72**
- `node scripts/bundle-ai-runner.mjs` → 115 MB; `import('node-llama-cpp')` → `getLlama` function; `ai-runner.mjs --specs` JSON
- Deploy: **нет**. Bump: **0.5.6**

## known_limitation

Живой NSIS install + загрузка GGUF ~2 ГБ в CI не гонялись. MCP host по-прежнему не sidecar. Нужен Node.js на машине (`node.exe` spawn). Publish/warm deploy — по слову PO «кати».

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17
closed_by: composer-executor-tzd-56
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (svelte-check 0/0)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
