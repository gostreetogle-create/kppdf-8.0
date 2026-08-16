# TZD-55 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZD-55.done.md` · lock `TZD-55-desktop-ai-runner-path.lock`
> Cursor Verdict: **PASS** 2026-08-16 (known limitation → TZD-56 sidecar)
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/TZD-55-desktop-ai-runner-installed-path.md`
> Wave: `tasks/_backlog/desktop/WAVE-DESKTOP-IA-SHELL.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (deepseek-v4-pro)
- claimed_at: 2026-08-16T20:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (одиночная сессия; `_active/` пуст после TZD-54 archive)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0` (main)
- [x] TZD-54 archived DONE (`tasks/_archive/2026-08/TZD-54.done.md`), `_active/` пуст от 54
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `aiRunner.ts` / `ai-runner/**` / `App.svelte`
- [x] TZ / wave прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-55.md` на месте

## Acceptance (из TZ)

- [x] Release path не падает с «path does not have a parent» (safeDirname + walkUpToPackage, unit-тест release-layout)
- [x] «Открыть папку моделей» открывает `…/models` и создаёт её (mkdir recursive)
- [x] Dev-режим не сломан (resolveDesktopDir walk + tsx fallback сохранён)
- [x] RU hint про ручную укладку .gguf (HINTS.openModelFolder)
- [x] RU-ошибки: Node не в PATH; раннер не найден в билде (KPPDF_AI_RUNNER_DIR)
- [x] Gates tsc + svelte-check + tsx --test PASS; deploy DEFERRED; bump не делал

## Integrity slot (до READY / archive)

- [x] Тип изменения: desktop core + UI — Layer 3
- [x] FIC §A–E — N/A
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] COUPLING-MAP — N/A
- [x] Deploy/wipe/seed — запрещены, не выполнялись

## Gates (факт)

| Gate | Command | Exit |
|------|---------|------|
| desktop tsc | `cd desktop && npx tsc --noEmit` | **0** (0 ошибок) |
| svelte-check | `cd desktop && npx svelte-check --threshold error` | **0** (0 errors, 0 warnings) |
| desktop tests | `npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` | **68/68** (+4 aiRunner) |

## Executor report

- **Стратегия (спека ШАГ 1.2):** выбран вариант «robust resolver + env override» (dev fallback сохранён). Полный NSIS sidecar/bundled-deps (Option A с node-llama-cpp) — отдельный follow-up, как и у MCP host (тот же известный limitation): esbuild в desktop нет, `tauri build`/installer в этом TZ не гоняется (deploy запрещён).
- **`aiRunner.ts`:** `AI_RUNNER_DIR_ENV='KPPDF_AI_RUNNER_DIR'` + `envAiRunnerDir()` (Vite meta / process.env); `safeDirname()` (не бросает «path does not have a parent» на корне); `walkUpToPackage()` — чистая функция обхода (вынесена для теста release-layout); `resolveDesktopDir()` = env → walk → guarded fallback. В `start()` проверка `exists(src/ai-runner/index.ts)` → понятная RU-ошибка с подсказкой env вместо спулинга несуществующего пути. `describeSpawnError` распознаёт «path does not have a parent» и «not found» → RU.
- **`App.svelte`:** `openModelFolder` теперь `mkdir(dir, {recursive:true})` перед `openExternal`; `HINTS.openModelFolder` — про ручную укладку `.gguf` (~2 ГБ, то же имя, что в списке).
- **Docs:** `desktop/docs/INSTALL.md` — раздел «Локальная модель (вкладка AI)»: GGUF Qwen2.5 Instruct, источник HF `bartowski`, `app-data/models`.
- **Тесты:** `src/core/aiRunner.test.ts` (+4): walkUpToPackage находит пакет / не бросает на корне (release layout) / null когда не найден; envAiRunnerDir из process.env.
- **Conflict disclosure:** не трогал Import/Form Studio, MCP tools, ai-runner HTTP API, Angular, seeds/PO-*/data/. Bump версии не делал (0.5.5 остаётся). Deploy нет.
- **Known limits:** живой download ~2 ГБ в CI не гоняем (PO качает вручную после publish); `node_modules/tsx` + `node-llama-cpp` в NSIS-билде не бандлятся — раннер в release пока падает на deps, но уже с понятным RU, а не «path does not have a parent»; sidecar — follow-up.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict **PASS** (2026-08-16) — path crash fixed; NSIS full run = TZD-56

## Closeout (после PASS)

- [x] archive + lock + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T20:45:00+03:00
