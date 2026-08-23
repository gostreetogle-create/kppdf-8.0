# TZ-KP-WS-402 — Checklist

**Status:** DONE

## Claim slot

| Поле | Значение |
|------|----------|
| agent_id | freebuff-1 |
| claimed_at | 2026-08-23T14:30:00+0300 |
| workspace | D:\kppdf-8.0 |
| team_room_claim | unavailable |

## Задача

ProposalWorkspaceStore + chrome rails IA (L3 + R4).

**CONFLICT KEYS:** `frontend/src/app/pages/commercial/proposals/workspace/*`; `shared/services/pi-chrome-tools.service.ts`; `proposal-workspace-demo.page.ts`
Проверка: `_active/` пуст по KP-WS; demo не тронут; chrome-tools service не менялся (right slot уже существует).

## Шаги

- [x] `ProposalWorkspaceStore` (signal state machine) + spec 11 кейсов
- [x] Chrome rails: left catalog/template/recipient, right params/table/terms/output — unique Lucide + RU
- [x] Wiring page: toggle/collapse/sheet/Escape + quotationId из query
- [x] Page spec: chrome registration snapshot + поведение (8 тестов)
- [x] Gates: tsc 0 · jest proposal 141/141 · eslint 0 · ng build PASS
- [x] Docs: kp-workspace.page.md, rail-ia STATUS note
- [x] Archive `tasks/_archive/2026-08/TZ-KP-WS-402.done.md`

## AC

- [x] Left 3 + right 4 в chrome, unique Lucide + RU labels
- [x] Store tests ≥8 (11)
- [x] Panel overlay; A4 rect unchanged (geometry)
- [x] No duplicate icon Template vs Terms
- [x] tsc + lint PASS

## Proof of adoption

1. Routed: `/proposals/workspace` — chrome tools L/R активны
2. Tests: store 11 + page 8
3. Docs: kp-workspace.page.md + rail-ia
4. Migration: store — единый источник состояния panel; запрещено дублировать сигналы в page
5. Legacy: demo-секции composition/client; create flyouts
