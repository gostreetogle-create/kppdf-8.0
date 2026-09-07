# TZ-NX-PHOTO-P3-FRAME-UI checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-PHOTO-P3-FRAME-UI.md` deleted at closeout)
> Wave: `WAVE-NX-CATALOG-PHOTOS` — **DONE** (P0→P3)
> Archive: `tasks/_archive/2026-09/TZ-NX-PHOTO-P3-FRAME-UI.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-07T20:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)
- reclaim: Freebuff free-session cutoff mid-gates (prior claim 2026-09-07T07:05:00+03:00); Claude closeout per `tasks/PROMPT-CLAUDE-FINISH-PHOTO-P3.md`

## Preflight

- [x] `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md` read
- [x] `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `tasks/_active/` and P3 task/prompt files read
- [x] P3 audit, photo API/types, UI patterns and build-integrity docs read
- [x] P0 `7c9d1071`, P2 `f2707641`, P1 `c0b675a7` are existing dependencies; do not rework them
- [x] Claim slot exists in `tasks/_active/TZ-NX-PHOTO-P3-FRAME-UI.md`

### Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `tasks/_active/TZ-NX-PHOTO-P3-FRAME-UI.md`, `tasks/_ready/nx-photos/TZ-NX-PHOTO-P3-FRAME-UI.md`, `docs/audits/2026-09-05-catalog-photos-nx-audit.md`, `docs/DEVELOPMENT-PATTERNS.md`, `docs/UX-FORM-CANON.md`, `docs/agent-checklists/WAVE-NX-CATALOG-PHOTOS.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/TZ-NX-BUILD-INTEGRITY.md`, `docs/GIT-POLICY.md`
- **Key Constraints:** Executor claim + no mid-wave pause; rectangular frame only; default `contain`/center; optional `cover` + `posX`/`posY`; parent-owned persistence through `PATCH /api/photos/:id/frame`; NX is the target; no P0/P1/P2 rework; no warehouse, supply, DocStudio or desktop scope
- **Planned Deliverable:** finish frame editor and dropzone overlay; apply frame style to an existing NX catalog-photo consumer; add focused specs for merged frame output and consumer helper; update photo-wave docs and closeout records
- **Validation Path:** focused photo Jest; frontend-nx app typecheck; changed-file lint; `pnpm architecture:check`; browser/DOM verification when a local app is available; final `nx build kppdf-web` last

## Acceptance

- [x] A user can open `Рамка` from an NX catalog-photo preview, switch between contain and cover, drag-pan a cover frame, and save a merged partial frame.
- [x] The frame save output is parent-owned and uses the existing `PiPhotosService.updateFrame` PATCH path; no second crop/write path is introduced.
- [x] Missing frames render as `contain` / `50% 50%`; cover frames apply clamped `object-position` to the dropzone preview and at least one existing NX list consumer (production Orders rail: collapsed icons + list).
- [x] Focused specs cover helper defaults/clamping, editor drag/toggle/save behavior, dropzone frame entry/output, and the existing PATCH request contract.
- [x] Known limitation is explicit: DocStudio/Gantt thumbnails outside the production rail may need a later frame-consumer sweep.

## Integrity slot (before READY / archive)

- [x] Type: other (shared NX photo UI + existing list consumer; no new route, permission, backend module or MCP)
- [x] FIC §A–E: N/A — no route, permission, backend module or MCP changed; catalog UI consumer and photo API remain existing paths
- [x] page.md / PAGE-TZ-INDEX: updated — `products.page.md`, `modules.page.md`, `materials.page.md`, `production-cockpit.page.md` one-line footer/table notes
- [x] DOMAIN-MAP: N/A — no module/route contour changed
- [x] SECTION-READINESS: N/A — no user-contour or permission change
- [x] Coupling map: N/A — no new status/FK coupling; existing `Photo.frame` read path only
- [x] No P0/P1/P2 or unrelated dirty WIP staged (docker-compose.yml, start.mjs, build-info.ts, data/, crm_analytics_tasks/, reports/ left untouched)
- [x] `docs/DOCS-INTEGRITY.md` followed

## Build integrity

- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` recorded before final code changes (green before and after the dead-code cleanup)
- [x] No unresolved competing claim for the P3 photo conflict keys
- [x] Closing `nx build kppdf-web` is the last gate command

## Gates (fact)

- PASS: `nx test paper-and-ink --testPathPattern=photo --skip-nx-cache` — 34 suites / 357 tests
- PASS: `nx test kppdf-web --testPathPattern=production-read.facade --skip-nx-cache` (ran full project) — 95 suites / 616 passed / 7 skipped / 0 failed
- PASS: frontend-nx typecheck — folded into `nx build kppdf-web` (Angular AOT compile); raw `tsc -p tsconfig.base.json --noEmit` is not this workspace's gate (pre-existing unrelated repo-wide errors, moduleResolution noise)
- PASS: changed-file lint (`nx lint kppdf-web` / `nx lint paper-and-ink`) — 0 new errors/warnings from P3 hunks; pre-existing `no-output-native` (orders-rail `select` output) and click/keyboard a11y errors (production-cockpit `onMainClick`) predate this wave, documented lint debt (STREAM-QUEUE.md)
- PASS: `pnpm architecture:check` — 1464 files, baseline 17, 2 resolved
- SKIPPED: browser/DOM smoke — no local app server started in this non-interactive closeout session; jest DOM coverage (drag-pan, toggle, save, dropzone wiring) stands in for it
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- Freebuff free-session cutoff mid-gates; re-claimed `agent_id: claude`. Code already on disk (frame editor, dropzone wiring, facade/rail thumbs, registries dialogs) reviewed end-to-end and found complete/consistent with canon — no rework, only closeout.
- Cleanup: removed dead `ProductionReadFacade.getOrderThumbMap` (superseded by frame-aware `getOrderThumbFrameMap`, no remaining callers/tests) and its stale doc reference in `production-cockpit.page.md`.
- conflict disclosure: the checkout contains unrelated dirty work (docker-compose.yml, start.mjs, build-info.ts, data/, crm_analytics_tasks/, reports/) — none of it staged.
- known limitation: DocStudio/Gantt thumbnails outside the production rail are not covered; separate sweep if PO wants them.

## Review handoff

- [x] READY FOR REVIEW recorded in the photo wave checklist (`WAVE-NX-CATALOG-PHOTOS.md` → DONE)
- [x] Archived after gates green

## Closeout

- [x] archive + DONE lock + progress + remove `_active` marker
- [x] Status = DONE
- closed_at: 2026-09-07T20:00:00+03:00
- implementation_sha: 2bfb22dc
