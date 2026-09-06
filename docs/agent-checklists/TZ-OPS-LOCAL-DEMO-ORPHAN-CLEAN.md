# Checklist: TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN

> Status: **DONE**
> TZ: `tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`
> PO auth 2026-09-06: local demo data virtual → careful orphan clean OK; not production wipe.

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T11:27:46+03:00
- closed_at: 2026-09-06T12:35:07+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed in this executor)
- mongo_target: `mongodb://localhost:27017/kppdf` from `.env` and `backend/.env` (local-only PASS)

## Preflight

- [x] Hotfix A is already DONE+pushed: `c413bef7`; A code was not reopened
- [x] `_NOW.md` and `tasks/_active/` checked before claim; no overlapping B conflict key claim
- [x] `tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`, audit, `GEMINI.md`, executor loop, and project context read
- [x] URI guard confirmed: only `localhost`/`127.0.0.1`/Docker-local hosts accepted; remote/prod URI stops before DB access
- [x] Docker local Mongo confirmed: `kppdf-mongo` (`mongo:7`) on `127.0.0.1:27017`
- [x] No `dropDatabase`, deploy wipe, production/Synology, catalog wholesale cleanup, or DocStudio layout change

### Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`, `docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md`
- **Key Constraints:** local Mongo/uploads only; dry-run first; remove only orphan supply/movement rows and broken image refs; preserve complete templates and all catalog/orders with valid relations
- **Validation Path:** guarded script dry-run/apply logs; post-clean orphan query; no seed unless data screens are incomplete; docs closeout and review diff

## Dry-run counts (before apply)

- [x] supply orphans: **5** (`supplytasks`; all reference missing order `6a74dd4cb6f3f3d16e16a9b3`)
- [x] stock-movement hard-missing refs: **6** (`stockmovements`; all reference missing products)
- [x] studio broken images: **7** (`document_templates` × 3 refs, `template_blocks` × 4 refs)
- [x] dry-run candidate IDs: retained in executor terminal evidence; no complete templates were deleted

## Applied

- [x] supply deleted: **5**
- [x] movements deleted: **6**
- [x] studio refs fixed: **7 total**
  - first apply handled the 7 reported candidates; post-check exposed one same-document array-index residual from the pre-batch implementation
  - a narrowly scoped apply bug fix batched background indexes; second apply fixed the remaining **1** ref (`0 supply / 0 movements / 1 image ref`)
- [x] seed-local-demo run? **No** — retained screen data was non-empty; no reseed was necessary or authorized

## Gates / evidence

- [x] local URI only (no prod): `.env` and `backend/.env` resolve to localhost; Docker container `kppdf-mongo` confirmed
- [x] dry-run PASS: `5 / 6 / 7` candidates before apply (supply / movements / image refs)
- [x] apply PASS: effective `5 / 6 / 7` changes; only listed local orphans/broken refs touched
- [x] post-clean orphan verification: **0 / 0 / 0** on repeat dry-run (supply / movements / image refs)
- [x] data-level screen smoke: orders and demo collections remain populated; no 404-producing orphan relation remains in the cleanup scope
- [x] visual Chrome/DocStudio smoke: **not run by explicit closeout scope**; Chrome IA / DocStudio was not started
- [x] `node --check scripts/clean-local-demo-orphans.mjs` and `git diff --check`: PASS
- [x] commit: implementation `6b1e949210415a8c3bf85b45a85d60f444afddb7`; metadata closeout recorded in the follow-up docs commit

### Post-clean collection sanity

Direct local DB count after apply: `orders=132`, `supplyrequests=127`, `supplytasks=119`, `stockmovements=118`, `products=186`, `materials=138`, `document_templates=17`, `studio_documents=29`, `template_blocks=73`. No catalog/order rows were deleted; complete templates/documents were preserved.

## Integrity slot (до READY / archive)

- [x] Type: other / ops data hygiene
- [x] FIC §A–E: N/A — no product route, permission, module, or MCP change
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI implementation change
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A — no product contour or shared field semantics change
- [x] Foreign WIP excluded; only B script + checklist/audit/archive/lock/_NOW intended for commit
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Executor report (auto)

- **Outcome:** DONE — local-only careful clean, no database drop/wipe, no seed, no UI/layout changes
- **Counts before:** `supply=5`, `movements=6`, `studio_image_refs=7`
- **Applied:** `supply_deleted=5`, `movements_deleted=6`, `studio_refs_fixed=7`
- **Counts after:** `supply=0`, `movements=0`, `studio_image_refs=0`
- **Implementation:** `scripts/clean-local-demo-orphans.mjs` (dry-run default; `--apply` guarded by local Mongo URI allowlist)
- **Commit:** implementation `6b1e949210415a8c3bf85b45a85d60f444afddb7`
