# TZ-MODULES-341 — checklist

Status: **DONE**

## Claim slot
- agent_id: Buffy
- claimed_at: 2026-08-16T00:19:17+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable
- active conflict check: clear; active marker restored before closeout after bookkeeping omission

- [x] CLAIM
- [x] form dropzone → PhotosService upload → ProductModulePhoto photoId link
- [x] detail upload primary; URL retained as collapsed secondary path
- [x] QC module L dropzone → PhotosService upload → ProductModulePhoto photoId link
- [x] specs + gates (tsc, Jest, lint, Prettier); archive + MASTER [x]; commit/push `6d8353d6`
## Gates (fact)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `cd frontend && pnpm exec jest src/app/pages/modules/module-form-dialog.component.spec.ts src/app/pages/modules/module-detail.page.spec.ts src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts src/app/shared/ui/photo/photo-dropzone.component.spec.ts src/app/pages/products/product-form-dialog.component.spec.ts src/app/pages/materials/material-form-dialog.component.spec.ts --runInBand` — PASS, 6 suites / 101 tests
- `cd frontend && pnpm lint` — PASS, 18 pre-existing architecture warnings, 0 errors
- `cd frontend && pnpm exec prettier --check <owned module/QC/photo files>` — PASS
- `git diff --check` — PASS for owned changes

## Integrity slot (до READY / archive)
- [x] Тип изменения: `other` — existing module/catalog UI; no new route/API
- [x] FIC §A–E: N/A — no route, permission, backend module, or MCP change
- [x] page.md / PAGE-TZ-INDEX: PAGE-TZ-INDEX updated with module photo coverage
- [x] SECTION-READINESS: N/A — existing catalog section
- [x] Чужой WIP не в коммите; conflict keys соблюдены; `data/*` excluded
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Executor report
- Module form now exposes the shared dropzone and attaches uploaded Photo ids to the saved module through ProductModulePhotosService.
- Module detail makes file/drag/paste upload primary, creates ProductModulePhoto `{ photoId }` links, and keeps URL entry collapsed as secondary.
- QuickCreate module L now exposes the same dropzone and links uploaded photos after module creation before presenting the composition panel.
- ProductModulePhotosService remains the only module-photo link write path; PhotosService remains upload-owned.
- Conflict disclosure: only TZ-341 module/QC files, wave/live docs, progress/status/index closeout are owned; `data/*`, `docs/PO-DIARY.md`, and unrelated WIP remain unstaged.
