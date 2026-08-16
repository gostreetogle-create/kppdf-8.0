# TZ-UX-344 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UX-344.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после Cursor PASS → archive + commit)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-ux344-WIN-LOQVGED63JM-28704
- claimed_at: 2026-08-16T09:39:57Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-UX-344; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `pi-showcase-card*` (CATALOG-375 = materials.page only)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW → DONE
- [x] `tasks/_active/TZ-UX-344.md` на месте (removed at closeout)

## Acceptance

- [x] Grid showcase media показывает фото целиком (contain), не crop cover
- [x] Gates PASS (tsc + pi-showcase-card tests)
- [x] Spec asserts contain; md override не возвращает cover

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (shared UI card CSS)
- [x] FIC §A–E: N/A — CSS object-fit only, no new fields/permissions/modules
- [x] page.md: one-line note products/modules/materials grid media contain
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: page.md notes only; DOCS-INTEGRITY N/A beyond page touch

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ TSC_PASS

cd frontend && pnpm test -- --testPathPattern="pi-showcase-card" --coverage=false --runInBand
→ PASS 12/12 (1 suite)
```

Closeout re-run (2026-08-16): TSC_PASS; 12/12 PASS.

Base HEAD (pre-closeout): `155af0e59fb3ac28b4f8d6686a152c6cda937042`

## Executor report

- `.sc-media img`: `object-fit: contain` + `object-position: center` (sm/md/lg inherit)
- Removed `.sc-media--md img { object-fit: cover }` override
- Spec TZ-UX-344 reads component source; asserts contain/center; no cover on base or md
- Page notes: products/modules.page.md grid media contain (materials.page.md note left in CATALOG-375 WIP — not staged)
- Did NOT touch materials.page.ts / list thumbs / CATALOG-375 product code
- Deploy: forbidden / not run
- Conflict disclosure: parallel CATALOG-375 owns materials.page only — no overlap

known_limitation: list-thumb `object-cover` on catalog list pages unchanged (out of scope / successor)

## Review handoff

- [x] READY FOR REVIEW (2026-08-16T09:45:00Z approx)
- [x] Cursor Verdict PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T09:45:00Z
