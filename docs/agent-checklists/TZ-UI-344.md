# TZ-UI-344 checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-UI-344.done.md`
> Commit/push: отдельный commit после staged-scope review

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-22T11:40:23+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room tool unavailable; checked tasks/_active and conflict keys locally)

## Preflight

- [x] Repository/workspace and branch checked before claim
- [x] `_NOW.md` and `tasks/_active/` checked; no photo/lightbox conflict claim found
- [x] TZ, project memory, UI/dialog/photo patterns and dependencies read
- [x] Claim slot filled before product code
- [x] `tasks/_active/TZ-UI-344-photo-lightbox-kit.md` existed before implementation

## Acceptance

- [x] Created shared `PiPhotoLightboxComponent` in `shared/ui/photo` and exported it from the barrel
- [x] Image uses `object-contain`, viewport-safe max height, and dark image surface
- [x] Escape and backdrop close are provided by the existing `PiDialogService`; explicit close button calls the shared ref
- [x] Dialog semantics, accessible label, image alt, unavailable empty/broken-source state, and keyboard-accessible triggers are covered
- [x] No zoom, pan, carousel, or gallery navigation was added
- [x] Product and module showcase cards open the lightbox from their real media region
- [x] Composition-tree thumbnails open the lightbox and stop row select/expand propagation
- [x] Product and module detail hero/gallery images open the same lightbox
- [x] Focused component, consumer, and shared-dialog tests pass
- [x] KP preview surfaces were not changed; optional-later scope remains untouched

## Integrity slot

- [x] Type: page/shared UI wiring; no new route, permission, backend module, API, MCP tool, or domain field
- [x] FIC §A–E: N/A because existing routes and APIs only receive UI behavior wiring
- [x] page.md / PAGE-TZ-INDEX: N/A because no route or page contract changed
- [x] SECTION-READINESS: N/A because existing catalog sections and readiness do not change
- [x] Coupling map: N/A because no shared domain field, status, or filter changed
- [x] `docs/DOCS-INTEGRITY.md` followed
- [x] Conflict keys limited to photo UI, showcase card, composition tree, and existing catalog/detail consumers
- [x] Unrelated dirty WIP remains unstaged

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] Focused Jest for lightbox/card/composition/products/modules/detail — **90/90 PASS**
- [x] Shared dialog service/component Jest — **23/23 PASS**
- [x] `cd frontend && pnpm lint` — PASS, 0 errors; 18 pre-existing architecture warnings
- [x] `cd frontend && pnpm exec prettier --check <all touched FE files>` — PASS
- [x] `pnpm architecture:check` — PASS (979 files; baseline 6)
- [x] `git diff --check` for TZ paths — PASS
- [ ] Full frontend Jest — 1827/1835 PASS; 8 unrelated pre-existing failures in `login.page.spec.ts` (missing ActivatedRoute provider) and `production-read.facade.spec.ts`; no TZ-UI-344 files involved
- [ ] Browser helper unavailable: `python scripts/with_server.py --help` failed because the repository has no `scripts/with_server.py`; authenticated live browser pass is recorded as BLOCKED, not claimed as PASS

## Executor report

- Added one reusable lightbox dialog with contain rendering, dark surface, close button, unavailable-image fallback, and shared dialog lifecycle.
- Wired real photos from product/module grids, composition tree, and product/module detail pages without changing upload/delete/set-main behavior.
- Preserved row selection/expansion and catalog navigation contracts through propagation guards and focused regressions.
- Conflict disclosure: repository contains unrelated backend/import-task, desktop/MCP, docs, and other dirty WIP; those paths were not staged.
- Known limitation: live authenticated browser verification requires the missing local helper or an already authenticated dev session; automated consumer and shared-dialog coverage is green.

## Review handoff

- [x] Acceptance and gates recorded; this backlog TZ has no separate Cursor-verdict gate
- [x] Ready for closeout after staged-scope review

## Closeout

- [x] Archive and lock created; active marker removed
- [x] `_NOW.md` updated after archive
- [x] Status = DONE
- closed_at: 2026-08-22T11:58:00+03:00
