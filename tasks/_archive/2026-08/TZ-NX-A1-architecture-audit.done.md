# TZ-NX-A1-architecture-audit — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-orchestrator

## Scope

Analysis-only audit of `frontend-nx` module graph, tags, import boundaries, and gates.
No product code changed.

## Project graph (5 nodes)

| Project | Tag | Depends on |
|---------|-----|------------|
| kppdf-web | type:app | paper-and-ink, data-access, http, features |
| paper-and-ink | type:ui | — |
| data-access | type:data-access | http |
| http | type:util | — |
| features | type:feature | data-access (+ implicit paper-and-ink) |

**Cycles:** none detected in `nx graph` dependencies.

## Tags & enforce-module-boundaries

`frontend-nx/eslint.config.mjs` defines `depConstraints` for `type:app`, `type:ui`, `type:data-access`, `type:feature`, `type:util`. Rules match intended layering:

- `type:ui` → only `type:ui`
- `type:data-access` → `type:util`, `type:data-access`
- `type:feature` → `type:ui`, `type:data-access`, `type:util`
- `type:app` → all lib types

## Import hygiene

| Check | Result |
|-------|--------|
| `pnpm run architecture:check:nx` | PASS — 181 files, 0 violations |
| Relative imports between libs | None cross-lib; internal relative imports within `paper-and-ink` and `data-access` only |
| Source imports vs public API | Apps use `@kppdf/*` paths; internal lib code uses relative paths (acceptable within lib) |
| `type:ui` → util-http/data-access/features | PASS — paper-and-ink has zero outbound lib deps |
| features/data-access → app only | PASS — kppdf-web is sole consumer |

## Gates

| Gate | Result |
|------|--------|
| `pnpm run architecture:check:nx` | PASS (0 violations) |
| `pnpm exec nx run-many -t lint --all` | PASS — 2 projects (paper-and-ink: 0 errors/35 warnings; kppdf-web: clean). **Note:** data-access, http, features lack `lint` target in project.json |

## Findings (non-blocking)

1. **Lint coverage gap:** only `kppdf-web` and `paper-and-ink` participate in `lint --all`; three libs have no lint target.
2. **Root barrel minimal:** `libs/ui/paper-and-ink/src/index.ts` exports only 3 symbols; consumers correctly use secondary `@kppdf/ui/*` paths.
3. **paper-and-ink lint warnings:** 35 `@typescript-eslint/no-non-null-assertion` in specs/production (pre-existing).

## Auditor report

NX architecture is sound: zero boundary violations, acyclic graph, tags enforce correct layering. Lint passes where configured. Recommend adding `lint` targets to data-access/http/features in a future TZ (out of audit scope).

## Checklist

See `docs/agent-checklists/TZ-NX-A1-architecture-audit.md` — Integrity slot filled, status DONE.
