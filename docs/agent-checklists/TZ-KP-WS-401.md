# TZ-KP-WS-401 — Checklist

**Status:** IN PROGRESS

## Claim slot

| Поле | Значение |
|------|----------|
| agent_id | freebuff-1 |
| claimed_at | 2026-08-23T14:09:09+0300 |
| workspace | D:\kppdf-8.0 |
| team_room_claim | unavailable |

## Задача

ProposalWorkspaceShellComponent (из demo) + route `/proposals/workspace`.

**CONFLICT KEYS:** `frontend/src/app/pages/commercial/proposals/demo/*`; `frontend/src/app/shared/**/proposal-workspace*`; `frontend/src/app/app.routes.ts`

Проверка `_active-map`: `_active/` пуст (TZ-400 archived). `app.routes.ts` — WIP demo-route (Wave 0, свой слот не нужен: это база задачи).

## Шаги

- [x] CLAIM `tasks/_active/TZ-KP-WS-401.md` + checklist
- [x] Прочитано: geometry.md, rail-ia.md, implementation-audit.md, kp-workspace.page.md, AI-AGENT-Guide.md
- [x] Shell ts/html/css извлечены из demo (frame → shell; dummy content остаётся в demo)
- [x] Shell spec ≥6 тестов
- [x] `/proposals/workspace` route + page с placeholder «подключение позже»
- [x] Demo page → thin wrapper (chrome tools + placeholders в проекциях)
- [x] Gates: tsc · jest proposal · lint
- [x] Geometry checklist (demo + workspace)
- [x] Docs: geometry § Files, kp-workspace.page.md, dummy README
- [ ] Archive `tasks/_archive/2026-08/TZ-KP-WS-401.done.md` + commit + push

## AC (из TZ)

- [ ] `/proposals/demo-workspace` визуально идентичен pre-TZ
- [ ] `/proposals/workspace` открывается, shell + empty panel
- [ ] Shell unit tests ≥6 PASS
- [ ] No rule shrinking A4 on panel open (landscape)
- [ ] tsc PASS · jest proposal-workspace PASS · lint PASS (touched)

## Proof of adoption

1. Routed: `/proposals/workspace` + demo wrapper
2. Tests: shell spec
3. Docs: kp-workspace-geometry.md § Files
4. Migration: demo CSS не дублируется долгосрочно (frame → shell.css)
5. Legacy: `proposal-create.page.ts` не тронут
