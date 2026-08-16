# PROMPT — TZ-PHOTO-304 only (Freebuff / лёгкая модель)

Ты лёгкий executor. **Один TZ.** Не волну PHOTO целиком.

Workspace MUST: `D:\kppdf-8.0`
Проверь: `Get-Location` + `git rev-parse --show-toplevel`.

## CLAIM (до кода)
1. Checklist `docs/agent-checklists/TZ-PHOTO-304.md` из `_TEMPLATE.md`
2. Marker `tasks/_active/TZ-PHOTO-304.md`
3. Status CLAIMED. Если чужой держит `photos.service` / photo schema → STOP.

## Сделай ТОЛЬКО
Спека: `tasks/_backlog/TZ-PHOTO-304-photo-frame-meta.md`  
Контекст волны (не делать всё): `tasks/_backlog/WAVE-PHOTO-FRAME-POSITION.md`

Цель v1 на Photo:
```ts
frame?: { fit: 'contain' | 'cover'; posX: number; posY: number } // % 0..100
```
Default без meta = contain + 50/50. PATCH frame без re-upload. FE `Photo` type + service method.

## НЕ
- Dropzone UI positioner (TZ-UX-PHOTO-302 — другой чат)
- Showcase/list consumers (TZ-UX-PHOTO-303)
- Менять UX-344 contain CSS «заодно»
- Deploy / wipe

## Gates
```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- --testPathPattern="photo" --coverage=false
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
(если FE-only types — достаточно frontend tsc + focused photo service test)

## Конец
READY FOR REVIEW. Не archive до Cursor PASS. Не начинай 302/303.
