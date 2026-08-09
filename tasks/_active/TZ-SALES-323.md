# TZ-SALES-323: Create КП — A4 fit без scrollbar на листе

PAGES: /proposals/create  
PAGE_DOCS: proposals-create.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-preview-wave2.md` §A  
Зависит от: TZ-SALES-321 DONE (фон/layout OK)

РОЛЬ АГЕНТА: fullstack (FE center scale + BE/CSS build HTML overflow)  
ЗАВИСИМОСТИ: нет блокирующих `_active` на тех же keys; не трогать 322 PARK  
LAYER: 3  
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; backend/src/modules/document-template/document-template.service.ts; backend/test/e2e/document-templates-build.e2e-spec.ts; docs/pages/proposals-create.page.md; docs/ux/kp-create-studio-spec.md

STATUS: CLAIMED / IN PROGRESS
Claim slot:
- agent_id: agent-6c3d05b80e
- claimed_at: 2026-08-09T11:38:09Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room reports Unknown task: TZ-SALES-323; checklist slot is source of truth)

Acceptance scope:
- FE preserves intrinsic 794×1123 iframe, contain scale, ResizeObserver, top-centered transform, and hidden sheet/stage overflow.
- Build HTML uses one A4 page box with html/body overflow hidden and no body padding/doc-content min-height overflow conflict.
- iframe document scrollWidth and scrollHeight are each <= client + 1px in portrait and landscape.
- Background, positioned layout, frozen 317 rails/overlay behavior, and all out-of-scope items remain unchanged.
- Required backend/frontend typechecks and focused tests pass.
- Archive only after Cursor/PO visual PASS on scroll.

## Executor report

- implementation: FE contain scale uses a 2px safety inset; build HTML is one fixed portrait/landscape A4 page box with hidden document overflow and bounded content/table wrapping.
- gates: backend/FE typechecks PASS; focused FE 9/9 PASS; direct backend build e2e 8/8 PASS with portrait + landscape CSS contract.
- review: READY FOR REVIEW; Cursor/PO must measure iframe document scrollWidth/Height and provide visual PASS before archive.
- known limits: empty table skeleton remains 324; live products remain 325; print/snapshot remain PARK.
