# TZ-NX-PHOTO-P3-FRAME-UI — DONE

- **agent_id:** claude (closeout; claimed by freebuff at 2026-09-07T07:05:00+03:00, free-session cutoff mid-gates)
- **implementation_sha:** 2bfb22dc
- **TZ:** tasks/_ready/nx-photos/TZ-NX-PHOTO-P3-FRAME-UI.md
- **Deps:** P0 `7c9d1071`, P1 `c0b675a7`, P2 `f2707641` — closed before start, not reworked.

## Что сделано

- **ШАГ 1 — Frame editor UI:** `pi-photo-frame-editor` (`@kppdf/ui/photo`) — modal viewport, contain/cover toggle, pointer-based drag-pan clamped to 0–100%; parent-owned save (emits merged partial `Partial<PiPhotoFrame>`, no internal persistence). Кнопка «Рамка» на каждом превью в `pi-photo-dropzone` открывает overlay dialog.
- **ШАГ 2 — Apply on thumbs:** `photoFrameStyle(frame)` helper (`object-fit` + `object-position`, fallback `contain`/`50% 50%`) применяется в dropzone-превью и в production Orders rail (collapsed icon rail + expanded list) через `ProductionReadFacade.getOrderThumbFrameMap` → `OrdersRailComponent.thumbs`.
- **ШАГ 3 — Write-path:** registries dialogs (product/module/material) `onPhotoFrameSave` → `PiPhotosService.updateFrame` (`PATCH /api/photos/:id/frame`), merges response/optimistic frame into local `photoItems`. Единственный write-path, как в каноне.
- **ШАГ 4 — Tests:** `pi-photo-frame-editor.component.spec.ts` (style helper defaults/clamping, drag-pan → merged partial, contain-mode no-op, toggle contain↔cover), `pi-photo-dropzone.component.spec.ts` (frame render + normalize malformed refs, frame-button opens editor + emits parent-owned save), `production-read.facade.spec.ts` (frame carried through `firstPhotoThumb`/`getOrderThumbFrameMap`).
- **ШАГ 5 — Docs:** `products.page.md`, `modules.page.md`, `materials.page.md`, `production-cockpit.page.md` — one-line P3 notes; `docs/audits/2026-09-05-catalog-photos-nx-audit.md` — P3 DONE section; `WAVE-NX-CATALOG-PHOTOS.md` → wave status DONE.
- **Cleanup:** removed dead `ProductionReadFacade.getOrderThumbMap` (superseded by frame-aware `getOrderThumbFrameMap`; no remaining callers or tests) and its stale reference in `production-cockpit.page.md`.

## Gates (все зелёные)

```
frontend-nx nx test paper-and-ink --testPathPattern=photo --skip-nx-cache → 34 suites / 357 tests PASS
frontend-nx nx test kppdf-web (full project incl. production-read.facade) → 95 suites / 616 passed / 7 skipped / 0 FAIL
nx lint kppdf-web / paper-and-ink (changed files) → 0 new errors/warnings from P3 hunks
pnpm architecture:check → 1464 files, baseline 17, 2 resolved
nx build kppdf-web (production) → SUCCESS (last gate)
```

## AC чек

1. Открыть «Рамка» на превью → contain/cover toggle + drag-pan (cover only) → Save шлёт merged partial ✔ (spec)
2. Persist только через существующий `PATCH /photos/:id/frame`, второй write-path не вводился ✔
3. Missing frame → `contain`/`50% 50%`; cover-фрейм клампится 0–100% на dropzone-превью и rail (icon + list) ✔ (spec)
4. Specs: helper defaults/clamping, editor drag/toggle/save, dropzone frame entry/output, facade PATCH-контракт через существующий `PiPhotosService.updateFrame` ✔
5. known_limitation явно зафиксирован ✔ (ниже)

## known_limitation

DocStudio/Gantt thumbnails за пределами production Orders rail не подключены к `Photo.frame` — нужен отдельный sweep, если PO решит их расширить. Zoom (помимо cover+pan) не в scope (не было в BE-контракте `TZ-PHOTO-304`).

## НЕ тронуто

P0/P1/P2 реализация (dropzone upload, form wiring, `Product.mainPhotoId`); circle avatar; второй cropper; BE frame schema shape; warehouse/DocStudio/desktop scope.
