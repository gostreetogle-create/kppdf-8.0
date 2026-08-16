# TZ-PHOTO-304 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-PHOTO-304.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (freebuff desktop/catalog session) → land: cursor-composer
- claimed_at: 2026-08-16T15:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: best-effort (no team room for this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на photo keys (UX-344 = showcase CSS, CATALOG-375 = materials list)
- [x] TZ / канон / deps прочитаны (`TZ-PHOTO-304-photo-frame-meta.md`, `WAVE-PHOTO-FRAME-POSITION.md`, PO-CANON.md)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PHOTO-304.md` на месте

## Acceptance

- [x] Schema + DTO + PATCH + FE type
- [x] Default contain/center documented (schema jsdoc + checklist + TZ)
- [x] Gates BE tsc + focused photo tests

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: backend API (Photo meta) + FE type
- [x] FIC §A–E: N/A — новое необязательное поле без write-path изменений потребителей
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route; canon doc для photo API отсутствует)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS

cd backend && pnpm exec jest --testPathPattern=photos --coverage=false
→ PASS (4 suites / 13 tests)

cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm exec jest --config jest.config.js --testPathPattern=photos.service.spec --coverage=false
→ PASS (2 suites / 8 tests)
```

## Executor report

- Schema `Photo.frame { fit: 'contain'|'cover', posX, posY }` + default contain/center (jsdoc + mongoose default)
- `CreatePhotoDto.frame?` + `UpdatePhotoFrameDto` + `PhotosService.updateFrame(id, dto)` — частичный merge поверх текущего frame
- `PATCH /photos/:id/frame` (admin/manager, audit update) — без перезагрузки файла
- FE: `PhotoFrame` interface + `Photo.frame?` + `PhotosService.updateFrame(id, frame)` через silentPatch
- Выбран v1 (fit + posX/posY, CSS object-position) — не v1b crop (соответствует TZ-рекомендации)
- Default без meta = `{ fit: 'contain', posX: 50, posY: 50 }` — документирован в schema jsdoc

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor unattended land PASS (AC + gates)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T13:51:23+03:00
