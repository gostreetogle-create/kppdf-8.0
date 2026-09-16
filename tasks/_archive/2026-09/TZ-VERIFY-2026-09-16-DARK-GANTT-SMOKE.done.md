# TZ-VERIFY-2026-09-16-DARK-GANTT-SMOKE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-16
closed_by: freebuff
verification:
  - acceptance criteria: WARN — authenticated visual routes blocked by local API HTTP 500; available dark token and focused behavior checks PASS
  - typecheck: N/A — docs-only closeout, baseline NX build PASS
  - tests: PASS — 2 suites / 62 focused Gantt tests
  - lint: N/A — no product code changed
  - checklist: ADDED and completed
  - progress.md: N/A — verification-only audit, no product behavior change
  - status synchronization: PASS — `_NOW.md` updated; active marker removed

## Evidence

- Audit: `docs/audits/2026-09-16-dark-gantt-smoke.md`
- Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` — exit 0.
- Focused tests: `gantt-bars.component.spec.ts` + `gantt-bar.model.spec.ts` — 62/62 PASS.
- Live preview: NX served on `http://127.0.0.1:4201`; login API returned HTTP 500, so `/production` and authenticated DocStudio routes could not be inspected.
- No code fix, palette change, deploy, or unrelated WIP staging.
