# TZ-UX-324 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-324.done.md`
> Spec: `tasks/TZ-UX-324-chrome-history-page-tools-gap.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: cursor-composer-executor
- claimed_at: 2026-08-15T14:52:53Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] workspace `D:\kppdf-8.0`
- [x] conflict keys free vs AUTH-308
- [x] Claim + `_active/TZ-UX-324.md`

## Acceptance

- [x] Spacer `chrome-rail-tools-gap` left+right only when tools exist
- [x] `app-chrome-page-tool` muted vs history raised
- [x] Empty tools → no spacer
- [x] `page-chrome.md` updated
- [x] tsc + Jest PASS

## Integrity slot

- [x] Тип: other (app shell chrome layout)
- [x] FIC §A–E: N/A — нет route/permission/module/MCP
- [x] `docs/pages/page-chrome.md` обновлён
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP (AUTH-308 nav) не в коммите
- [x] docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm exec jest src/app/layout/app-layout.component.spec.ts --runInBand --no-coverage → 7/7 PASS
git diff --check → PASS
```

## Executor report

- Layout CSS + spacer DOM only; no production flyout / PiChromeToolsService API changes
- Conflict disclosure: `app-layout.component.ts` had AUTH-308 devices-nav WIP — surgical commit excluded those hunks

## Closeout

- [x] archive + lock + progress + remove `_active`
- Status = DONE
- closed_at: 2026-08-15T15:00:00Z
