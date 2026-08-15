# TZ-UX-PHOTO-301 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UX-PHOTO-301.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor; leave peer WIP unstaged)

## Claim slot

- agent_id: buffy-executor-photo-301
- claimed_at: 2026-08-15T16:24:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI not required for this wave; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — AUTH-305 / STUDIO-D keys не пересекаются
- [x] TZ / GEMINI прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-UX-PHOTO-301.md` был на месте (removed after archive)

## Acceptance

- [x] При выборе файла сразу виден bar + RU status (не только muted текст)
- [x] Dropzone не открывает picker пока uploading (`aria-busy`)
- [x] По завершении индикатор исчезает; превью появляется
- [x] Ошибка upload — `role="alert"` RU сохранена
- [x] Light/dark читаемо; tsc + Jest PASS
- [x] known_limitation: % может быть null → indeterminate bar обязателен

## Integrity slot

- [x] Тип: page (forms photo UX)
- [x] FIC: N/A route change — note in product-detail + PAGE-TZ-INDEX
- [x] PAGE-TZ-INDEX обновлён (DONE)
- [x] SECTION-READINESS: N/A (локальный UX индикатор)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm exec jest photo-dropzone + product/material/quick-create specs --runInBand --no-coverage
→ 4 suites / 88 tests PASS

git diff --check (conflict-key files)
→ PASS
```

## Executor report (auto)

- **Что сделано:** `PhotosService.uploadWithProgress` + `uploadPhotosWithProgress`; dropzone progress UI; product/material form progress parity; QuickCreate `progressPercent` wiring; specs updated; page docs note.
- **Conflict disclosure:** не трогал Production Studio / AUTH-305 / backend photos.
- **known_limitation:** точный % зависит от браузера/прокси (Content-Length); без totals — indeterminate bar, не тишина.
- **Deploy:** не выполнялся.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T16:30:00Z
