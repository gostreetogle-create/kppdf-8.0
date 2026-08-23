# TZ-KP-WS-400 (часть A) — Parity matrix + state ownership map

**Date:** 2026-08-23
**Executor:** claude
**Outcome:** DONE (часть A only — docs-only)

## Objective

Pre-implementation audit for `WAVE-KP-SINGLE-WORKSPACE` (#0). Часть A covers only:
1. Parity matrix — every functional unit of production `/proposals/create`
   (dual L/R flyout studio) mapped to source file, data-test selector, backing
   API, and persisted/request-only/UI-only classification.
2. State ownership map — ≥10 `Proposal`/`Quotation` fields, each traced to its
   exact line in the save payload (`saveDraft`) or preview payload
   (`rebuildPreview$`), proving whether it is persisted, request-derived, or
   local UI state.

Rail IA (левый/правый/ribbon, icon dedup), MCP readiness, embedded-settings
scope, multi-supplier flow detail, and parity test plan are **out of scope**
for часть A — covered separately by часть B
(`docs/pages/kp-workspace-rail-ia.md`) and часть C
(`docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md`).

## Source task

`tasks/TZ-KP-WS-400.md` (full wave TZ) → this archive covers the "часть A"
scope claimed in `tasks/_active/TZ-KP-WS-400.md`.

## Conflict keys

- `docs/audits/2026-08-23-kp-workspace-implementation-audit.md`

## Note on concurrent claims

While reading source files, two other sessions appended claims to the same
`tasks/_active/TZ-KP-WS-400.md`: freebuff-1 (часть B, rail IA) and freebuff-2
(часть C, MCP/embedded-settings/multi-supplier/test-plan). freebuff-2 initially
listed the same conflict key as часть A; PO confirmed часть C's actual output
is the separate file `docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md`
(already present on disk), so no overlap remained. PO directed: write only
§ parity matrix + state ownership map to the shared audit filename, do not
touch `kp-workspace-rail-ia.md` or the mcp-supplier-audit file.

## Affected files

- `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` (created — §1, §2, §3 only)

## Acceptance criteria (часть A subset of full TZ)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Parity matrix ≥25 rows (each flyout + output + catalog review) | PASS | 45 rows, §1 |
| 2 | State ownership map ≥10 Quotation fields with source-of-truth | PASS | 25 fields, §2, each with payload line citation |
| 3 | PO CANON not edited | PASS | only audit file created |
| 4 | No product code touched | PASS | `frontend/**`/`backend/**` untouched, read-only |

Other full-TZ criteria (rail IA, icon dedup, MCP section, embedded-settings,
multi-supplier docs, parity test plan) belong to часть B/C — not claimed here.

## Commands and exit codes

Not applicable — docs-only change, no code/tests touched.

## Browser QA

Not applicable.

## Known limitations

- Some line-number citations in §2/§1 are approximate (`~line N`) from a
  single read pass of a 2600+ line file; exact numbers may drift by a few
  lines on future edits — verify against current file before relying on
  citations for a code change.
- Version-menu markup (row #41) was not visible in the read excerpt (signals
  only); flagged for whoever implements the workspace version-menu port.

## Successor tasks

- TZ-KP-WS-401..409 (rail IA execution, MCP wiring, embedded settings,
  cutover) — this audit is their prerequisite input.

## Archive marker

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: claude
source_task: tasks/TZ-KP-WS-400.md
scope: part-A-only
protected_files:
  - docs/audits/2026-08-23-kp-workspace-implementation-audit.md
affected_areas:
  - docs/audits/
acceptance_status: PART_A_ONLY_PASS
verification: DOCS_ONLY_NO_TESTS
review: NOT_REQUESTED
lock_file: NOT_CREATED
successor_required: TRUE
```
