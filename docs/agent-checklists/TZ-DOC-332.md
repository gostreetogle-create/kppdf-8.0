# TZ-DOC-332 — Builder Inspector IA + visual canon

## Pre-edit checklist

- **Status:** IN WORK
- **Task/spec:** `tasks/TZ-DOC-332-builder-inspector-ia-visual-canon.md`
- **Created before first code edit:** yes (2026-08-02)
- **Out of scope:** canvas / block-renderer / tool-pane structure / backend / DOC-336

## Conflict-key audit

| Key | Peer overlap |
|-----|--------------|
| `builder-inspector.component.ts` | none in `_active` |
| `builder-inspector.component.spec.ts` | none |
| `docs/pages/builder-inspector.page.md` | none |
| `docs/pages/PAGE-TZ-INDEX.md` | shared docs — touch DOC-332 line only |
| `docs/agent-checklists/TZ-DOC-332.md` | this file |

## Plan

1. One `insp-section` chrome (header 13px uppercase, hairline sections, 16px pad).
2. Modes A–D IA reorder; snap/pageNumbering → `app-pi-switch`; no Inter/hex.
3. Compact layer toolbar; Edit ≠ Delete row.
4. Spec section-order + gates; page doc + PAGE-TZ-INDEX; archive.

## Gates (fill after)

- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] jest `builder-inspector` --no-coverage
- [ ] `git diff --check` on DOC-332 files

## Manual AC (record)

- [ ] canvas click → document context + snap
- [ ] block click → geometry first
- [ ] multi 2 → group/layer/danger
- [ ] template props → style + background

## Executor report (auto)

_(fill on archive)_
