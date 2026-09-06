# TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06T12:35:07+03:00
closed_by: freebuff
agent_id: freebuff
workspace: `D:\\kppdf-8.0`
implementation: `scripts/clean-local-demo-orphans.mjs`
commit_sha: 6b1e949210415a8c3bf85b45a85d60f444afddb7

## Outcome

- Added a guarded cleanup utility with dry-run as the default and explicit `--apply` mode.
- Confirmed the target was local-only: Docker container `kppdf-mongo` (`mongo:7`) exposed on `127.0.0.1:27017`, database `kppdf`; `.env` and `backend/.env` resolved to localhost Mongo URIs.
- Removed exactly the known local demo orphans: 5 `supplytasks` with missing `orderId` targets and 6 `stockmovements` with hard-missing product references.
- Removed 7 broken Doc Studio image references whose files were absent from local `backend/uploads`: 3 template background entries and 4 template-block image URLs. Complete templates/documents were preserved.
- A first apply exposed one same-document array-index residual; the minimal script correction batches background indexes, and the second apply removed the remaining 1 image ref. No unrelated data was touched.
- `seed-local-demo.mjs` was not run: the retained demo data remained populated and no reseed was necessary.

## Counts

```text
before dry-run: supply=5, movements=6, studio_image_refs=7
first apply:    supply=5, movements=6, studio_refs=6 (one array-index residual remained)
second apply:   supply=0, movements=0, studio_refs=1
final apply:    supply=0, movements=0, studio_refs=0
final dry-run:  supply=0, movements=0, studio_image_refs=0
```

Effective cleanup totals: `5` supply rows deleted, `6` movement rows deleted, `7` broken image refs removed.

## Verification

- `node scripts/clean-local-demo-orphans.mjs`: PASS before apply (`5 / 6 / 7` candidates).
- `node scripts/clean-local-demo-orphans.mjs --apply`: PASS; only listed local candidates were changed.
- `node scripts/clean-local-demo-orphans.mjs --apply`: PASS with zero remaining candidates.
- `node scripts/clean-local-demo-orphans.mjs`: PASS after apply (`0 / 0 / 0`).
- `node --check scripts/clean-local-demo-orphans.mjs`: PASS.
- `git diff --check` on owned script/checklist: PASS.
- Direct local DB sanity counts preserved `orders=132`, `products=186`, `materials=138`, `document_templates=17`, `studio_documents=29`, `template_blocks=73`; no catalog/order rows were deleted.
- Image reference audit over `document_templates`, `studio_documents`, and `template_blocks`: 6 remaining upload refs, all files present; 0 missing files.
- Visual Chrome/DocStudio smoke was intentionally not run in this closeout; Chrome IA was not started.

## Scope integrity

- No `dropDatabase`, deploy wipe, production/Synology target, wholesale catalog cleanup, seed, app-shell/warehouse code, DocStudio layout, Chrome IA, desktop, or foreign WIP changes.
- The working tree contains unrelated shared WIP; only B conflict keys and closeout metadata are intended for the focused commit.

## Executor report (auto)

TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN completed on local Docker Mongo. Counts and post-clean zero verification are recorded above and in `docs/agent-checklists/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`; implementation commit: `6b1e949210415a8c3bf85b45a85d60f444afddb7`.
