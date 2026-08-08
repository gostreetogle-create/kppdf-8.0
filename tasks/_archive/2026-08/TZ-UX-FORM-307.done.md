# TZ-UX-FORM-307 — Form Wave B batch 1 sections

**Outcome:** DONE
**Date:** 2026-08-08
**Source:** `tasks/_backlog/shop-north-b/TZ-UX-FORM-307-form-wave-b-batch1.md`
**Agent:** agent-e51db87918
**Team Room:** unavailable — backlog task is not present in the Team Room registry

## Delivered

- Added the shared `app-pi-form-section` primitive to the contract dialog.
- Grouped contract basics, positions, and notes under the Material-style sections «Основные данные», «Позиции», and «Дополнительно».
- Grouped work-type basics and optional scheduling/Gantt fields under «Основные данные» and «Дополнительно».
- Confirmed the organization kind-C FullEditor already uses the shared section primitive and its existing regression spec remains green; no duplicate organization dialog or business-logic change was introduced.
- Preserved existing dialog sizes, FormControl names, submit DTOs, API calls, and payload construction.

## Scope

Changed only the two dialogs that were flat on current `main`, plus checklist/closeout documentation. The source TZ names an absent `organization-form-dialog.component.ts`; the actual organization editor is `organization-full-editor-dialog.component.ts`, already sectioned by the preceding Party wave.

## Verification

- Acceptance criteria: PASS
- Frontend typecheck: PASS
- Angular production template build: PASS (existing budget warnings only)
- Targeted ESLint: PASS
- Frontend Jest: PASS (132 suites, 1247 tests)
- `git diff --check`: PASS
- Payload/control-name review: PASS
- `verify-status.sh`: pre-existing FAIL for 72 legacy kit-era entries outside this frontend scope; disclosed and not modified

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T18:02:00Z
closed_by: agent-e51db87918
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - template build: PASS (existing budget warnings only)
  - tests: PASS (132 suites / 1247 tests)
  - lint: PASS (targeted)
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS for this root backlog wave; global kit verify retains pre-existing legacy drift
  - archive: CREATED
known_limitation: global OrchestratorKit verify-status legacy drift (72 entries), outside TZ scope
