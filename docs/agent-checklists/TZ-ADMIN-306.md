# TZ-ADMIN-306 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-ADMIN-306.md` (должен существовать, пока не archive)
> Commit/push: **YES** (PO: commit allowlist после gates)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: buffy-freebuff-306
- claimed_at: 2026-08-06T16:07:38Z
- workspace: D:\kppdf-8.0 (Freebuff worktree a405897c, branch freebuff/frontend-…-a405897c)
- team_room_claim: unavailable (Team Room CLI недоступен из Freebuff worktree; claim слот в checklist — источник истины)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree `D:/kppdf-8.0/.freebuff/worktrees/a405897c-…`; canonical `D:\kppdf-8.0` на HEAD 050f460 (git pull --ff-only: origin/main == HEAD, ничего тянуть)
- [x] Прочитал `_active-map.md` + `tasks/_backlog/admin/TZ-ADMIN-306.md` — нет чужого CLAIM на те же keys (CATALOG-320/311 keys = products/modules, не пересекаются)
- [x] GEMINI.md, docs/AI-AGENT-GUIDE.md, docs/PO-DIARY.md §1–§4, kppdf-executor-continuous прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-ADMIN-306.md` на месте

## Acceptance

- [x] User form role dropdown = live API list (director + custom) — `PiRolesService.list` + RU label map
- [x] /admin → redirect на /admin/users; `_admin-placeholder.page.ts` удалён (нет фейкового «in development»)
- [x] Custom role assignable — jest smoke: роли из API (вкл. custom) рендерятся в dropdown нового пользователя
- [x] FE tsc (allowlist files) + focused tests PASS; в commit только allowlist

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS на allowlist (0 ошибок в pages/admin + app.routes); full-repo red ×9 — pre-existing group-chips WIP parallel session #1 (не allowlist, не трогал)
- `cd frontend && pnpm test -- --testPathPattern="admin|user-form|role-form|roles-admin|users-admin"` → PASS (4 suites / 45 tests)

## Executor report

- User form: role <select> загружается из GET /admin/roles (PiRolesService), value=role name, RU-лейбл (system map + custom label), системные сначала, edit-mode safety + fallback на ошибке.
- /admin → redirect /admin/users; _admin-placeholder удалён.
- Smoke: jest — custom роль из API рендерится в dropdown нового пользователя; live-stack E2E отложен (нет Mongo/BE в worktree, стек общий с #1).
- Conflict disclosure: чипы (group chips) параллельной сессии #1 НЕ трогал; их tsc-ошибки pre-existing на origin/main HEAD.

## Review handoff

- [x] READY FOR REVIEW — diff review внутри сессии (code-reviewer)
- [x] Архив после gates PASS (TZ не требует отдельного Cursor PASS — LAYER 2, PO дал прямое указание closeout)

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-ADMIN-306.done.md` + lock + progress + checklist DONE + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-06T16:30:00Z
