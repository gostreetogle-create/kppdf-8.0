# TZ-ADMIN-301 checklist

> Status: **DONE**  
> Marker: archived → `tasks/_archive/2026-08/TZ-ADMIN-301.done.md`  
> Commit/push: **YES** (own files only)

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer)
- claimed_at: 2026-08-08T08:22:17Z
- closed_at: 2026-08-08T08:26:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; announced via send)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_active-map.md` + `tasks/_active/` — no peer CLAIM on same keys
- [x] TZ + chrome-nav-admin-smell + RBAC PAGE_KEYS read
- [x] Claim slot filled
- [x] `tasks/_active/TZ-ADMIN-301.md` (removed at archive)

## Acceptance

- [x] System role: RU badge + read-only view explaining frozen
- [x] Custom role: pages[] matrix includes NAV pageKeys (Клиенты/Снабжение/…)
- [x] Seed PAGE_KEYS + RU labels cover NAV 2026-08-08 (`text-block-categories` gap fixed)
- [x] Admin API create/update/list exposes `pages`
- [x] tsc + jest PASS; archive; push (own files only; no app-layout; no peer WIP)

## Audit — NAV pageKey vs PAGE_KEYS seed (2026-08-08)

| pageKey | NAV | PAGE_KEYS | Notes |
|---------|-----|-----------|-------|
| products … admin-roles | ✓ | ✓ | full set |
| counterparties | ✓ | ✓ | Клиенты |
| supply | ✓ | ✓ | Снабжение |
| text-block-categories | ✓ | ✓ | **was gap → fixed** |
| form-profiles route | ✓ | via `dictionaries` | no separate key |

## Gates (факт)

```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit → PASS
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit → PASS
fe jest pages/admin/(user-form|role-form|users-admin|roles-admin|permission-labels) → 5 suites / 56 PASS
be jest modules/admin/(roles-admin|permissions-admin|toClientUser) → 3 suites / 23 PASS
```

## Executor report

- System badge + Смотреть (view mode, no submit)
- Pages matrix + permissions matrix in role dialog
- BE: AdminCreate/UpdateRoleDto.pages, toClientRole.pages, catalog.pages
- Conflict disclosure: BE admin DTO/mapper/catalog beyond listed keys (required for AC)
- Not staged: user-form / users-admin / chrome peer WIP / app-layout

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T08:26:00Z
