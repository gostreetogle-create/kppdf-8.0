# TZD-32 checklist

> Status: **DONE** (archive TZD-32.done.md; stale CLAIM cleared 2026-08-17)
> Marker: `tasks/_active/TZD-32.md` (создан при CLAIM)
> Commit/push: yes after DONE

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `buffy`
- claimed_at: `2026-08-10T20:45:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] TZD-31 в `_archive/2026-08/TZD-31.done.md`
- [x] Нет чужого CLAIM на journal/write-tools keys
- [x] Прочитал `tasks/TZD-32-material-propose-fields.md`
- [x] Claim slot + `tasks/_active/TZD-32.md`

## Acceptance

- [x] ProposeMaterialCreateDto whitelist: pricePerUnit, materialKind, description, dimensions
- [x] confirm → MaterialService.create сохраняет поля
- [x] MCP zod + MCP.md updated
- [x] Tests: price round-trip; invalid kind 400
- [x] BE tsc + mutation-journal tests; desktop/mcp test+tsc

## Integrity slot

- [x] Тип: MCP + backend module
- [x] FIC: N/A — journal propose DTO расширение, новой web-страницы нет (thin note)
- [x] page.md N/A
- [x] Conflict keys only

## Gates (факт)

- backend `tsc -p tsconfig.build.json --noEmit`: PASS
- backend `pnpm test -- mutation-journal`: 20/20 PASS (3 новых DTO-валидации + 3 сервисных round-trip/regression)
- desktop/mcp `pnpm test`: 79/79 PASS (5 новых тестов zod/payload/batch)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- Deploy: NO

## Executor report (auto)

- `ProposeMaterialCreateDto` + `pricePerUnit` (≥0) / `materialKind` (@IsIn MATERIAL_KINDS) / `description` (≤2000) / `dimensions` (переиспользован `DimensionDto` из material module — не копипаст валидаторов).
- propose payload = spread dto.create → confirm передаёт поля в `MaterialService.create` без потерь (round-trip тест pricePerUnit 420).
- Batch propose-batch items — те же поля (CreateProposalDto reuse).
- MCP: exported `materialCreateInput` + `batchItemSchema` (zod зеркало) + `buildMaterialCreateProposal`; batch использует его же (default unit `шт`).
- invalid materialKind → ошибка валидации DTO (400 на уровне контроллера) + zod reject — 0 SoT; regression без новых полей PASS.
- MCP.md write-таблица обновлена. mcp-runtime не трогали; deploy NO.
- Commit: `63ea90aa2c825447b2c91507f19d16cd17af2a89`

## Closeout

- [ ] archive + lock + progress; deploy NO; commit+push
- closed_at: _(ISO)_
