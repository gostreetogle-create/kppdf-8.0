# TZ-SALES-378 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-378.md`

## Claim slot

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T07:40:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable _(root)_

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_NOW` + `_active` vs AUTH-305 OK
- [x] TZ + 376 audit прочитаны
- [x] Claim; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-378.md` на месте

## Acceptance

- [x] Multipage outer CSS includes `.doc-bg` (фон не слетает)
- [x] `.doc-page { position: relative }`
- [x] Auto next capacity = full sheet ≫ short first frame
- [x] Continuation table layout remapped full-page
- [x] Specs + docs
- [x] Gates PASS

## Integrity slot

- [x] Тип: page (+ build)
- [x] page.md / PAGE-TZ-INDEX
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите

## Gates / Executor report / Review

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor PASS

## Closeout

- [ ] archive + lock + progress + `_active` removed
- [ ] Status = DONE
- closed_at: _(ISO)_
