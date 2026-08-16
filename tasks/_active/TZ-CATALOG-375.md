# TZ-CATALOG-375 — ACTIVE CLAIM

> Source: `tasks/TZ-CATALOG-375-materials-list-expandable-preview.md`
> Checklist: `docs/agent-checklists/TZ-CATALOG-375.md`
> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-CATALOG-375.md`

## Claim

- agent_id: agent-3e757640b7 (frontend executor)
- claimed_at: 2026-08-16T12:39:07Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-CATALOG-375; sync tasks first)

## Conflict keys

- `frontend/src/app/pages/materials/materials.page.ts`
- `frontend/src/app/pages/materials/materials.page.spec.ts`
- `frontend/src/app/pages/materials/materials.page-373.spec.ts`
- `docs/pages/materials.page.md`

## Outcome

READY FOR REVIEW — gates green (tsc + materials.page 25/25); await Cursor PASS before archive.

## Scope

`/materials` list row-click → gold expand tray with info blocks; detail via name / «Открыть карточку».
Do NOT touch products.page / modules.page / desktop / chrome-rail migrate.
