# TZ-NX-PO-SWEEP-04: studio Данные — thumb в строках + список до низа панели

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build AOT)
  - tests: PASS (823/830, 7 skipped, 0 failed; +8 new)
  - lint: N/A (не запускал отдельно, build/AOT clean)
  - checklist: ADDED
  - progress.md: N/A (ops/UX sweep wave)
  - status synchronization: PASS

## Root cause

1. `app-pi-showcase-card` size="sm" only rendered the media slot
   `@if (mediaUrl())` — no photo meant no slot at all (not even a
   placeholder), so every card without a resolved photo showed nothing.
2. Vitrina's own `photoUrl()` treated an unpopulated `photoIds[0]` (a bare
   ObjectId string, when the list endpoint doesn't populate refs) as a
   ready-to-use `<img src>` — guaranteed 404.
3. `.vitrina-grid { max-height: 480px; overflow-y: auto }` capped the list
   inside a panel body (`.kp-ws-panel__body`) that is *already* the flex
   scroll container for the whole Данные panel — the cap cut the list off
   mid-panel and left a dead gap below it.

## Fix

`pi-showcase-card.component.ts` (sm): media slot always renders;
`[class.sc-media--empty]` on no-url or broken image; `.sc-media--sm` 40→48px,
`.sc-row` min-height 56→60px; new `mediaBroken` signal + `(error)` handler
falls back to the empty-media placeholder instead of a broken `<img>`.

`studio-data-vitrina.component.ts` `photoUrl()`: rewritten to only resolve
from populated photo refs (mirrors `production-read.facade.ts`'s
`firstPhotoUrl`/`firstPhotoThumb` — thumb-variant preference + mainPhotoId
first); bare ObjectId strings now correctly resolve to `''` → placeholder.
`mainPhotoId` is now passed for all 4 kinds, not just parts/materials.

`.vitrina-grid`: removed the `max-height`/`overflow-y` — the panel body
already scrolls the whole Данные section (tabs+search+grid) as one unit.

## Gates

| Gate | Result |
|------|--------|
| `nx test kppdf-web` (full suite) | PASS 823/830 |
| `nx build kppdf-web` | PASS |

## Files changed

- `frontend-nx/libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.ts`
- `frontend-nx/libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.spec.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts`
- `docs/agent-checklists/TZ-NX-PO-SWEEP-04-studio-data-vitrina-thumbs.md` (new)
