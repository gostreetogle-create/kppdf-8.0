# TZD-42 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-42.md` (удалён после archive)
> Commit/push: **YES** per continuous executor skill (commit+push on each closed TZ)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (freebuff/task-a8e057ba-9f16-48dc-92db-a89ba256be39)
- claimed_at: 2026-08-11T23:25:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree; HEAD 5de482d4 = TZD-41 landed)
- team_room_claim: unavailable (no Team Room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → repo root confirmed
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`tasks/_active/` пуст)
- [x] TZ / канон / deps прочитаны (TZD-42 + audit §5.3)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-42.md` на месте

## Acceptance

- [x] Есть тест «100 propose→confirm подряд» без 404 (material) — `mutation-journal.service.spec.ts`
- [x] Root cause записан в checklist/archive (1 абзац: журнал sound; 404 = неверный id из-за
      парсинга §5.2 → TZD-41; TZD-42 зафиксировал тестами + эхо id)
- [x] toolFail/HTTP на missing proposal включает proposalId в тексте (`proposalId=…` в confirm/cancel)
- [x] `cd backend && pnpm test -- mutation-journal` PASS (26/26)
- [x] `cd desktop/mcp && pnpm test` PASS (115/115) `&& pnpm exec tsc --noEmit` PASS
- [x] Deploy НЕ

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: MCP + backend mutation-journal (Layer 3)
- [x] FIC §A–E N/A: нет UI-route / permission / builder-изменений
- [x] page.md / PAGE-TZ-INDEX N/A (нет UI route)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`tasks/_active/` пуст до claim)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm test -- mutation-journal` → **PASS** 26/26 (21 → 26, +5 новых)
- `cd desktop/mcp && pnpm test` → **PASS** 115/115 (+2 TZD-42 chain/echo теста)
- `cd desktop/mcp && pnpm exec tsc --noEmit` → **PASS**
- `git diff --check` → PASS (см. коммит)

## Executor report

- Root cause: 404 в аудите — неверный парсинг proposalId (TZD-41 fix); журнал sound
  (proposed не удаляется; expiry → 400; ownership → 403). Доказано тестами.
- Сделано: backend spec +5 (100× loop, wrong-id 404 с id, cross-user 403, admin-org 403,
  double-confirm 400); MCP confirm/cancel эхо-тит proposalId; MCP e2e chain-тест;
  MCP.md troubleshooting.
- Conflict disclosure: backend product-code НЕ менялся (только spec); desktop/mcp
  write-tools.ts (наши же conflict keys TZD-42).
- Known limits: live replay на проде не выполнялся; Deploy НЕ.

## Review handoff

- [x] READY FOR REVIEW: WAVE-MCP-AUDIT-P0 (continuous executor skill — commit+push на TZ)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-11T23:55:00Z
