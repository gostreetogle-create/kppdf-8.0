# WAVE — DocStudio Editor Decomposition (2026-09-14)

> Pack: `tasks/_ready/2026-09-14-docstudio-editor-decomp/`  
> Audit: [`docs/audits/2026-09-14-docstudio-god-component-decomposition.md`](../../../docs/audits/2026-09-14-docstudio-god-component-decomposition.md)  
> Decisions PO (2026-09-14): page/routes/guard **remain in app**; Phase 1 facade **in-place**; Phase 5 canvas/table split → **PARK**.

## Goal

Инкрементально вынести мозг и dumb-UI редактора `/studio/:id` в `@kppdf/features` (`libs/features/src/lib/doc-studio/`), оставив `StudioEditorPage` тонким клеем app-chrome (`ShellToolRailService`, shared registry dialogs, HostListeners).

## Chain (sequential — one kppdf-web at a time)

| # | SIZE | TZ id | Path | Depends |
|---|------|-------|------|---------|
| 1 | L | `TZ-NX-DOCSTUDIO-EDITOR-FACADE` | [TZ-NX-DOCSTUDIO-EDITOR-FACADE.md](./TZ-NX-DOCSTUDIO-EDITOR-FACADE.md) | — |
| 2 | S | `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE` | [TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md](./TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md) | Phase 1 archived |
| 3 | L | `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE` | [TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.md](./TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.md) | Phase 2 archived |
| 4 | S | `TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES` | [TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md](./TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md) | Phase 3 archived |

**PARK / successor (не в этой волне):** `TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT` — сплит canvas / table-properties (см. [PARK-PHASE5.md](./PARK-PHASE5.md)).

## Target layout (after Phase 4)

```
apps/kppdf-web/src/app/pages/studio/
  studio-editor.page.ts          # thin glue + providers
  studio-list.page.ts
  studio-templates-list.page.ts
  studio.routes.ts
  studio-dirty.guard.ts
  studio-editor-*.spec.ts        # stay with page (TestableEditor)

libs/features/src/lib/doc-studio/
  index.ts                       # public API
  studio-editor.facade.ts
  util/                          # pure helpers + specs
  ui/                            # dumb components + studio-local dialogs + specs
```

Import path: `@kppdf/features/doc-studio` (secondary path in `tsconfig.base.json`, same pattern as `@kppdf/data-access/auth`). **No new Nx project.**

## Hard rules (all phases)

1. No behavior change: `catalogWriteChain`, 409 soft-retry, liveRows, PDF/preview — move/relocate only.
2. No new NgRx; Signals + instance-scoped Facade (`providers` on page, not `providedIn: 'root'`).
3. Page / routes / guard **never** leave `apps/kppdf-web/.../pages/studio/` in this wave.
4. Shared registry dialogs stay in `apps/.../doc-studio/dialogs/` (`TableTemplateFormDialog`, `TextBlockFormDialog`) — opened from **page** after Phase 4 if facade cannot import app.
5. `nx build kppdf-web` green before claim and last before archive.
6. No parallel second TZ on `kppdf-web/src/**`.

## Prompts

| When | File |
|------|------|
| **Full wave 1→4 (preferred)** | [PROMPT-CLAUDE-WAVE-1-4-CONTINUOUS.md](./PROMPT-CLAUDE-WAVE-1-4-CONTINUOUS.md) |
| Live tracker | `docs/agent-checklists/WAVE-DOCSTUDIO-EDITOR-DECOMP-CONTINUOUS.md` |
| Phase 1 only (if split session) | [PROMPT-CLAUDE-PHASE1-FACADE.md](./PROMPT-CLAUDE-PHASE1-FACADE.md) |
| Phases 2→4 only (after 1 DONE) | [PROMPT-CLAUDE-PHASES-2-4.md](./PROMPT-CLAUDE-PHASES-2-4.md) |

## Status

| Phase | Status |
|-------|--------|
| 1 Facade in-place | DONE (142d66e4) |
| 2 Util → features | READY |
| 3 UI → features | READY |
| 4 Facade → features | READY |
| 5 UI split | PARK |
