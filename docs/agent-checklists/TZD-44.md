# TZD-44 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-44.md` (удалён после archive)
> Commit/push: **YES** per continuous executor skill (commit+push on each closed TZ)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (freebuff/task-a8e057ba-9f16-48dc-92db-a89ba256be39)
- claimed_at: 2026-08-12T00:55:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree; HEAD 9d4d141e = TZD-43 landed)
- team_room_claim: unavailable (no Team Room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → repo root confirmed
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`tasks/_active/` пуст)
- [x] TZ / канон / deps прочитаны (TZD-44 + audit §5.5 + docs/ops/DANGEROUS-OPS.md)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-44.md` на месте

## Acceptance

- [x] find_duplicates находит ≥1 группу на фикстуре с двумя одинаковыми именами
- [x] cleanup без userOk → 0 DELETE/PATCH (гейт до запросов)
- [x] cleanup dryRun → список, 0 мутаций
- [x] cleanup с userOk + prefix «Тест» / id ТестФорма — soft-delete через существующий API
- [x] `cd desktop/mcp && pnpm test` PASS (132) `&& pnpm exec tsc --noEmit` PASS
- [x] MCP.md: Hygiene protocol
- [x] Deploy НЕ; на проде cleanup НЕ запускался (ждёт явного PO «да, чисти Тест*»)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: MCP (hygiene tools, Layer 3)
- [x] FIC §A–E N/A: нет UI-route / permission / builder-изменений
- [x] page.md / PAGE-TZ-INDEX N/A (нет UI route)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`tasks/_active/` пуст до claim)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd desktop/mcp && pnpm test` → **PASS** 132/132 (+13 TZD-44)
- `cd desktop/mcp && pnpm exec tsc --noEmit` → **PASS**
- `git diff --check` → PASS (см. коммит)

## Executor report

- Сделано: hygiene-tools.ts (find_duplicates + cleanup_test_data с гейтами),
  backendDeleteJson, регистрация (toolCount 84), 13 тестов, MCP.md Hygiene protocol.
- Conflict disclosure: новые файлы hygiene-tools.ts/.test.ts + backend.ts + tools.ts +
  tools-registry.test.ts + MCP.md (keys TZD-44). Backend product-code НЕ менялся
  (используем существующие DELETE endpoints).
- Known limits: prod cleanup не запускался (нужен явный PO); Deploy НЕ.

## Review handoff

- [x] READY FOR REVIEW: WAVE-MCP-AUDIT-P0 (continuous executor skill — commit+push на TZ)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T01:20:00Z
