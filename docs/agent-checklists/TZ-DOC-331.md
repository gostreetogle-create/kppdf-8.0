# TZ-DOC-331 — Builder group drag by `groupId`

## Pre-edit checklist

- **Status:** DONE (implementation + gates)
- **Task/spec:** `tasks/TZ-DOC-331-builder-group-drag-by-groupid.md`
- **Out of scope respected:** nested groups, GlobalErrorHandler, insertBlock, backend.

## Conflict-key audit

PO cleared parallel canvas/page session. Touched only DOC-331 keys (+ helper/spec/docs).

## Implementation

1. `builder-group-drag.ts` — `resolvePositionedDragPeers` prefers `groupId` from `allBlocks`.
2. `block-renderer` — drag uses that list; emits `select` at drag start for full-group selection.
3. `builder-canvas` — `[allBlocks]="blocks()"` on all renderer instances.
4. Layout persist only patches `layout` (membership untouched).

## Gates

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] jest `builder-group-drag|builder.page.spec|builder-canvas` — 39 passed
- [x] `ng build --configuration=development`
- [x] `git diff --check` on DOC-331 files (CRLF warnings only)

## Manual AC

Operator: Group → canvas click → drag one member → all move; Ungroup only via button.

## Executor report (auto)

- status: DONE (FE) + **hotfix backend persist**
- outcome: group-drag peers by groupId; selection sync; **backend update/create now write `groupId`** (was missing — UI-only groups)
- commits: none (PO did not request commit)
- evidence: docs/agent-checklists/TZ-DOC-331.md
- residual: restart backend watch if needed; hard-refresh FE; re-group once so Mongo gets groupId

### Hotfix 2026-08-02 (PO: still broken)

Root cause beyond FE drag: `TemplateBlockService.update()` / `create()` never assigned
`dto.groupId` → PATCH succeeded but Mongo stayed without membership → reload and
`updateLayouts` refresh wiped the local group.
Fix: assign `groupId` in create + update in `template-block.service.ts`.
FE: `onLayoutChanges` merges preserve local groupId if server omits it.
