# TZ-SALES-319 — DONE (Create КП build HTML preview)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T11:17:19Z
closed_by: agent-ccee39fec2
superseded_by: TZ-SALES-321 (fidelity integration)
verification:
  - acceptance criteria: PASS (build HTML replaces stub preview in the frozen SALES-317 shell)
  - Cursor integration: PASS
  - PO visual: PASS — background and approximately four positioned blocks match builder preview
  - frontend typecheck: PASS
  - tests: PASS — proposal-create 8/8
  - checklist: UPDATED + Executor report (auto)
  - progress.md: UPDATED
  - status synchronization: UPDATED

## Delivered

- Create КП now renders `DocumentTemplatesService.build()` HTML in a sandboxed iframe instead of template metadata/draft-line stub chrome.
- Existing SALES-317 rails/overlay shell is preserved; no template selector was returned to the sheet.
- The combined SALES-321 fix adds absolute `/uploads` rewriting, A4 contain scaling, `ResizeObserver`, and hidden sheet overflow.
- Rebuilds remain wired to template and organization changes; empty state remains the existing CTA.

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern=proposal-create` → PASS 8/8

Implementation commit: `1e759801`
Closeout lock: `.mimocode/locks/TZ-SALES-319-create-kp-template-build-preview.lock`
Deploy: NO
