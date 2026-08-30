# TZ-NX-B0-2: Nx lint targets for data-access / features / http

**РОЛЬ АГЕНТА:** executor (Freebuff / Claude CLI / Gemini)  
**ЗАВИСИМОСТИ:** none (parallel-safe with B0-1 if different worktree; **sequential** in same checkout)  
**LAYER:** frontend-nx Nx config  
**CONFLICT KEYS:** `frontend-nx/libs/data-access/project.json`; `frontend-nx/libs/features/project.json`; `frontend-nx/libs/util/http/project.json`

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `tasks/_archive/2026-08/TZ-NX-A1-architecture-audit.done.md`

- `pnpm exec nx run-many -t lint --all` runs only **2** projects: `paper-and-ink`, `kppdf-web`.
- `data-access`, `features`, `http` have `eslint.config.mjs` but **no** `lint` target in `project.json`.
- Reference: `paper-and-ink/project.json` → `"lint": { "executor": "@nx/eslint:lint" }`.

## ЧТО ДЕЛАТЬ

1. **Claim:** `tasks/_active/TZ-NX-B0-2-library-lint-targets.md` + `docs/agent-checklists/TZ-NX-B0-2-library-lint-targets.md`.
2. Add `lint` target to each `project.json` mirroring `paper-and-ink` convention.
3. Verify per-lib `eslint.config.mjs` extends root — fix config wiring only if lint fails to start.
4. **Do not** fix pre-existing lint warnings/errors in TS source — config-only TZ.
5. Update `frontend-nx/README.md` §Verify only if lint command docs need the new projects listed.
6. Gates → archive → delete active claim.

## ИЗМЕНЯТЬ

- `frontend-nx/libs/data-access/project.json`
- `frontend-nx/libs/features/project.json`
- `frontend-nx/libs/util/http/project.json`
- `frontend-nx/libs/**/eslint.config.mjs` (only if required for lint to run)
- `frontend-nx/eslint.config.mjs` (only if required)
- `frontend-nx/README.md` (optional doc line)

## НЕ ИЗМЕНЯТЬ

- TypeScript/HTML/CSS source in libs
- path aliases (`tsconfig.base.json`)
- `package.json` dependencies
- unrelated legacy warnings in source files

## КРИТЕРИИ ПРИЁМКИ

```bash
cd frontend-nx
pnpm exec nx run data-access:lint
pnpm exec nx run features:lint
pnpm exec nx run http:lint
pnpm exec nx run-many -t lint --all   # expect 5 projects
pnpm exec nx build kppdf-web
cd ..
pnpm run architecture:check:nx
```

- All gates PASS (lint may report warnings; **0 errors** required).
- Archive: `tasks/_archive/2026-08/TZ-NX-B0-2-library-lint-targets.done.md`
- FAIL → `.failed.md` + active claim retained with reason.

## CLAIM

```
agent_id: <executor-id>
claimed_at: <ISO-8601>
```
