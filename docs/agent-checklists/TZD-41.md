# TZD-41 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-41.md` (удалён после archive)
> Commit/push: **YES** per continuous executor skill (commit+push on each closed TZ)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (freebuff/task-a8e057ba-9f16-48dc-92db-a89ba256be39)
- claimed_at: 2026-08-11T22:05:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree; merged origin/main @ 52cb59cb)
- team_room_claim: unavailable (no Team Room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → repo root confirmed
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`tasks/_active/` пуст)
- [x] TZ / канон / deps прочитаны (TZD-41 + audit §5.1–5.2)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-41.md` на месте

## Acceptance

- [x] Любой `kppdf_propose_*` success JSON содержит **top-level** `proposalId: string`
      (proposeEnvelope; интеграционный тест с mock fetch)
- [x] Любой SoT-create success JSON содержит **top-level** `id: string` (не только `_id`)
      (createEnvelope; тест counterparty_create `_id` → `id`)
- [x] Alias или rename: агент может вызвать list doc-types / import-tasks / text-block-categories
      через канон `kppdf_list_*` без угадывания (канон + deprecated alias на 1 волну)
- [x] У ключевых тулов есть `outputSchema` в tools/list (тест registry: 61 тул, AC-набор проверен)
- [x] `cd desktop/mcp && pnpm test` PASS (113/113); `pnpm exec tsc --noEmit` PASS
- [x] MCP.md обновлён; progress + archive по GEMINI.md
- [x] known_limitation: полный sweep всех 70+ tools outputSchema — successor (AC покрыт)
      (domain/inbox/audit тулы без outputSchema, но со structuredContent)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: MCP (desktop/mcp, Layer 3)
- [x] FIC §A–E N/A: нет UI-route / permission / builder-изменений; только MCP-слой
- [x] page.md / PAGE-TZ-INDEX N/A (нет UI route)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (никто не CLAIMED те же keys)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd desktop/mcp && pnpm test` → **PASS** 113/113 (+7 новых тестов к волне)
- `cd desktop/mcp && pnpm exec tsc --noEmit` → **PASS**
- `git diff --check` → PASS (см. коммит)

## Executor report

- Сделано: envelope-канон в tool-result.ts (structuredContent + extractProposalId/
  extractEntityId + propose/create/mutation/batch envelope), все write-tools → top-level
  proposalId/id, commercial SoT-creates → top-level id, naming canon kppdf_list_* +
  deprecated aliases (8 имён), outputSchema на 61 туле, MCP.md обновлён (Response
  envelope + naming canon + toolCount 82).
- Conflict disclosure: правлены только desktop/mcp/src + desktop/docs/MCP.md +
  desktop/pnpm-lock.yaml (починка stale lockfile: tsx переехал в dependencies).
- Known limits: live replay на проде не выполнялся (live MCP — старая версия кода);
  domain/inbox/audit тулы без outputSchema — successor; Deploy НЕ.
- Попутно: `desktop/pnpm-lock.yaml` был stale (не совпадал с package.json — tsx) —
  починен минимально (pnpm install, diff 6 строк).

## Review handoff

- [x] READY FOR REVIEW: WAVE-MCP-AUDIT-P0 (TZD-41 → 42 → 43 → 44); review не
      требовался перед archive (continuous executor skill — commit+push на каждую TZ)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-11T23:10:00Z
