# TZ-PHOTO-304 DONE — Photo frame meta (position in rect)

```
ARCHIVE_MARKER
task_id: TZ-PHOTO-304
outcome: DONE
closed_at: 2026-08-16T13:51:23+03:00
agent_id: cursor-composer (unattended land / WAVE-DEPLOY-98)
workspace: D:\kppdf-8.0
branch: main
review: Cursor Verdict PASS (AC + gates)
```

## Что сделано

- Schema `Photo.frame { fit: 'contain'|'cover', posX, posY }` + mongoose default contain/center.
- `CreatePhotoDto.frame?` + `UpdatePhotoFrameDto` + `PhotosService.updateFrame` (partial merge).
- `PATCH /photos/:id/frame` (no file re-upload).
- FE: `PhotoFrame` + `Photo.frame?` + `PhotosService.updateFrame` via silentPatch.
- Default без meta = `{ fit: 'contain', posX: 50, posY: 50 }` (jsdoc + schema default).

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --testPathPattern=photos --coverage=false` → PASS **4 suites / 13 tests**
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- Optional FE `photos.service.spec` → PASS **2 suites / 8 tests**

## Не трогали

- Dropzone UI (→ TZ-UX-PHOTO-302)
- Consumer sweep (→ TZ-UX-PHOTO-303)
- NAV-303 / login / data/**
- Deploy

## Review

Unattended land after READY FOR REVIEW + AC verify + green gates → archive.

---

## Original TZ

# TZ-PHOTO-304: Photo frame meta (position in rect) — IN PROGRESS

> CLAIMED / IN PROGRESS — Buffy @ 2026-08-16T15:00:00+03:00 · workspace `D:\kppdf-8.0`
> Checklist: `docs/agent-checklists/TZ-PHOTO-304.md`

> PO unparked WAVE-PHOTO-FRAME-POSITION; выполняю только #1 (TZ-PHOTO-304).
> Dropzone UI (UX-PHOTO-302) и consumer sweep (UX-PHOTO-303) — следующие чаты.

РОЛЬ АГЕНТА: Backend + FE types

ЗАВИСИМОСТИ: TZ-UX-344 READY (default contain в showcase) — код не пересекается

CONFLICT KEYS: `backend/src/modules/photos/photo.schema.ts` ; `backend/src/modules/photos/photos.service.ts` ; `backend/src/modules/photos/photos.controller.ts` ; FE `frontend/src/app/shared/services/photos.service.ts`

PAGES: N/A (API)

---

## Выбор варианта

v1 (рекомендованный, тонкий):

```ts
frame?: {
  fit: 'contain' | 'cover'; // default 'contain'
  posX: number;             // 0..100, CSS object-position %
  posY: number;             // 0..100
}
```

Default без meta = `{ fit: 'contain', posX: 50, posY: 50 }`.
PATCH photo frame без перезагрузки файла. List/get отдают frame.

## НЕ

- Dropzone UI (→ TZ-UX-PHOTO-302)
- Consumer sweep (→ TZ-UX-PHOTO-303)
- Deploy

## AC

- [ ] Schema + DTO + PATCH + FE type
- [ ] Default contain/center documented
- [ ] Gates BE tsc + focused photo tests

## Финализация

archive после Cursor PASS. Deploy нет.
