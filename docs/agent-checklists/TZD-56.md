# TZD-56 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZD-56.done.md` · lock `TZD-56-desktop-ai-runner-nsis-sidecar.lock`
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/_backlog/desktop/TZD-56-desktop-ai-runner-nsis-sidecar.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor-tzd-56
- claimed_at: 2026-08-17T19:13:23+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ, не kit TZ-NN; `_active/` был пуст)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на aiRunner / src-tauri
- [x] TZ / TZD-55 archive / INSTALL прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-56.md` на месте
- [x] TZ-UX-371 skipped (archive `TZ-UX-371.done.md` уже есть); очередь B = TZD-56
- [x] Чужой dirty WIP на main не стейджим

## Acceptance

- [x] Установленный билд (симуляция resourceDir): NSIS без src → bundled `ai-runner.mjs`, без tsx и без env на monorepo
- [x] Dev `tauri dev` не сломан: src+tsx побеждает leftover bundled mjs
- [x] Bump installer trio 0.5.6; warm deploy **не** делался
- [x] Import/Form Studio не трогались
- [x] Gates PASS

Primary signal: bundled `--specs` + `import('node-llama-cpp')` from resource cwd — met
Secondary: tsc / svelte-check / 72 tests — PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: MCP/desktop packaging (FIC §E)
- [x] FIC §A–D N/A (нет web route / permission / Nest module); §E обновлён; §F N/A
- [x] page.md / PAGE-TZ-INDEX — N/A (нет UI route)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

| Gate | Command | Exit |
|------|---------|------|
| desktop tsc | `cd desktop && npx tsc --noEmit` | **0** |
| svelte-check | `npx svelte-check --threshold error` | **0** (0/0) |
| desktop tests | `npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` | **72/72** |
| bundle | `node scripts/bundle-ai-runner.mjs` | **0** (~115 MB) |
| specs smoke | `node ai-runner.mjs --specs` | JSON cpus/RAM |
| llama import | `import('node-llama-cpp')` from resource cwd | `getLlama` function |

## Executor report

- Option B: Vite SSR `ai-runner.mjs` + nested pnpm copy of `node-llama-cpp` (CPU win-x64; CUDA/Vulkan skip).
- `resolveAiLaunchPlan`: dev src+tsx wins over leftover resource; NSIS uses bundled mjs.
- NSIS hook stops Desktop tree before update (locked `.node`).
- MCP sidecar **не** делался. Node.js на клиенте всё ещё нужен для spawn.
- Чужой WIP (TZ-UX-371 uncommitted, seeds, `_park`) не стейджился.

## Review handoff

- [x] TZ не требует Cursor Verdict inbox
- Deploy DEFERRED до «кати»

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-17T19:45:00+03:00
