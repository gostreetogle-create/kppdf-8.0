# TZD-55: Desktop AI — раннер path resolver (release) + папка моделей

> Wave: WAVE-DESKTOP-IA-SHELL. PO smoke: «path does not have a parent» при Запустить.
>
> РОЛЬ АГЕНТА: Desktop core (`aiRunner.ts`) + тонкий UI AI.
>
> ЗАВИСИМОСТИ: TZD-54 DONE.

LAYER: 3

CONFLICT KEYS: `desktop/src/core/aiRunner.ts` ; `desktop/src/App.svelte` ;
`desktop/docs/INSTALL.md` ; `docs/agent-checklists/TZD-55.md`

CHECKLIST: `docs/agent-checklists/TZD-55.md`
REVIEW: Cursor Verdict **PASS** 2026-08-16 (с known limitation — см. ниже)

---

## Что сделано (коротко)

1. **`aiRunner.ts`:** `KPPDF_AI_RUNNER_DIR` + `envAiRunnerDir()`; `safeDirname()`; `walkUpToPackage()`; `resolveDesktopDir()` = env → walk → guarded fallback.
2. **`start()`:** проверка `src/ai-runner/index.ts` → понятная RU + env, без cryptic «path does not have a parent».
3. **`App.svelte`:** `openModelFolder` → `mkdir(recursive)` + RU hint про ручную укладку `.gguf`.
4. **Docs:** `desktop/docs/INSTALL.md` — локальная модель / HF bartowski / app-data/models.
5. **Тесты:** +4 в `aiRunner.test.ts` (walk / root / null / env).

## Verification

- `cd desktop && npx tsc --noEmit` → **0** (executor report)
- `npx svelte-check --threshold error` → **0/0**
- `npx tsx --test …` → **68/68** (+4)
- Commit: `86b08c79` (pushed)
- Deploy: **нет**. Bump: **не** (остаётся 0.5.5)

## Cursor Verdict

**PASS** — AC по «не падает с path does not have a parent» + папка моделей + gates выполнены.

**known_limitation (честно):** полный NSIS sidecar / bundled `tsx`+`node-llama-cpp` **не** сделан. В чистом install без `KPPDF_AI_RUNNER_DIR` на дерево с `src/ai-runner` раннер всё ещё не стартует (понятный RU вместо cryptic). Successor: **TZD-56** (sidecar/bundle).

ARCHIVE_MARKER
outcome: DONE
date: 2026-08-16
agent: freebuff; Cursor PASS
archive: tasks/_archive/2026-08/TZD-55.done.md
lock: .mimocode/locks/TZD-55-desktop-ai-runner-path.lock
code: 86b08c79
deploy: DEFERRED
bump: none (0.5.5)
successor: TZD-56 NSIS ai-runner sidecar/bundle
