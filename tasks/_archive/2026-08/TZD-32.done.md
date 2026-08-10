# TZD-32 — Material propose fields — DONE

- closed_at: `2026-08-10T21:00:00Z`
- agent: `buffy`
- workspace: `D:\kppdf-8.0`
- status: DONE
- wave: WAVE-MCP-GAP-2026-08-10 #2
- scope: propose material.create whitelist расширен (price/kind/description/dimensions) BE + MCP zod, confirm round-trip, docs, tests.

## Acceptance evidence

- `ProposeMaterialCreateDto` принимает `pricePerUnit` (≥0), `materialKind` (MATERIAL_KINDS), `description` (≤2000), `dimensions` (`DimensionDto` переиспользован из material module).
- propose→confirm: payload spread из `dto.create`; confirm передаёт поля в `MaterialService.create` — round-trip тест: `pricePerUnit: 420` + `materialKind: purchased` доходят до `materials.create`.
- Batch propose-batch items — те же поля (общий `CreateProposalDto`).
- Invalid `materialKind` / negative price / bad dimension → ошибки валидации (контроллер 400) / zod reject — 0 SoT.
- Regression: propose без новых полей → payload = `{ name, unit }` как раньше.
- MCP zod `materialCreateInput` + `batchItemSchema` зеркалят DTO; `buildMaterialCreateProposal` (default unit `шт`); MCP.md write-таблица обновлена.

## Gates

- backend `tsc -p tsconfig.build.json --noEmit`: PASS
- backend `pnpm test -- mutation-journal`: 20/20 PASS
- desktop/mcp `pnpm test`: 79/79 PASS
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- Deploy: NO

## Files

- `backend/src/modules/mutation-journal/dto/create-proposal.dto.ts` — whitelist расширение.
- `backend/src/modules/mutation-journal/dto/create-proposal.dto.spec.ts` — new (valid / invalid / regression).
- `backend/src/modules/mutation-journal/mutation-journal.service.spec.ts` — propose payload, confirm round-trip, regression.
- `desktop/mcp/src/write-tools.ts` — zod schemas + payload builder; handler + batch используют его.
- `desktop/mcp/src/write-tools.test.ts` — new (parse, reject, payload mirror, batch).
- `desktop/docs/MCP.md` — write-таблица.
- checklist `docs/agent-checklists/TZD-32.md`; marker `tasks/_active/TZD-32.md` removed; lock `.mimocode/locks/TZD-32-material-propose-fields.lock`.

## known_limitation

- Полный `CreateMaterialDto` (assortment, grade, photos…) — successor при нужде.
- Update patch whitelist ужесточение — отдельный hardening TZ.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (desktop/mcp без lint-скрипта; backend lint не в зоне изменений)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
