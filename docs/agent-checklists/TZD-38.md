# TZD-38 checklist

> Status: **DONE**
> Source: `tasks/TZD-38-spec-bom-composition-import.md`
> Commit/push: **YES** per wave protocol

## Claim slot

- agent_id: `Buffy/canonical-main`
- claimed_at: `2026-08-10T18:53:59Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` — `Unknown task: TZD-38; sync tasks first`

## Preflight

- [x] Canonical `D:\kppdf-8.0`; TZD-37 was DONE, archived, locked, committed, and pushed
- [x] Read `_active-map.md` + canonical `tasks/_active/`; only TZD-38 was claimed
- [x] Read TZD-38, Excel Studio audit/wave, GEMINI, and executor skill
- [x] Claim slot filled before product-code edits
- [x] WAVE-MCP-GAP 31→34 was DONE; no active parallel GAP claim
- [x] Foreign dirty TZ-AUTH-301/login/PAGE-TZ-INDEX WIP preserved and excluded

## Acceptance

- [x] Fixture path covers product + module + two materials with quantity; four focused parser tests pass
- [x] Hierarchy columns `level`, `parentArticle`, `article`, `name`, `qty`, `unit`, `kind` are detected; explicit parent and level inference both work
- [x] Flat files without hierarchy remain non-hierarchical and keep the TZD-37 mapping path
- [x] Missing parent, invalid quantity, duplicate article/link, invalid root/type are visible before confirmation
- [x] Studio renders product → module → material tree and has an explicit final HITL confirmation button
- [x] Confirm path creates missing Product/Module/Material records only after the button and then uses existing Product/Module composition REST endpoints; no local DB or silent write
- [x] MCP exposes draft-only `kppdf_propose_module_create` / `kppdf_propose_composition_line` and `userOk:true` confirm tools
- [x] `desktop/docs/MCP.md` documents tool names, safety protocol, flat fallback, and TZD-35 closure
- [x] TZD-35 PARK note updated to CLOSED / UNPARKED by TZD-38 in `WAVE-MCP-GAP-2026-08-10.md`

## Integrity slot

- [x] Тип изменения: Desktop UI + MCP composition HITL; no `desktop/mcp-runtime/**`
- [x] FIC §A–E reviewed; catalog Product/Module/Material composition contract reused
- [x] page.md / PAGE-TZ-INDEX: N/A — desktop app; audit is the page contract
- [x] SECTION-READINESS: desktop import surface and composition safety documented
- [x] Чужой WIP не в коммите; `docs/pages/PAGE-TZ-INDEX.md`, login, TZ-AUTH-301, and `_active-map` foreign edits remain unstaged
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- [x] `pnpm --dir desktop typecheck` — PASS
- [x] `pnpm --dir desktop check` — PASS, 0 errors / 0 warnings
- [x] `pnpm --dir desktop build` — PASS (Vite build; existing dynamic-import warnings only)
- [x] `pnpm --dir desktop/mcp exec tsx ../src/core/specification-import.test.ts` — PASS, 4/4
- [x] `pnpm --dir desktop mcp:check` — PASS, 93/93 tests + MCP tsc
- [x] `git diff --check` — PASS
- [ ] Native Tauri/window and live API catalog smoke — unavailable in this headless session; endpoint contract and UI path are covered by typecheck/parser/MCP gates

## Executor report

- **2026-08-10T19:01:12Z · Executor: Buffy/canonical-main**
- Implemented `desktop/src/core/specification-import.ts`: hierarchy detection, level/parent inference, normalization, tree preview, quantity/kind/parent/duplicate conflict validation, and flat fallback.
- Added four focused parser tests with the required product/module/material fixture.
- Extended Import Studio with a tree preview and explicit `Подтвердить и записать состав` HITL action. Missing entities are created only from that action; composition uses existing Product/Module REST endpoints.
- Added MCP draft/confirm tools for module creation and composition lines with `userOk` fail-closed behavior; module→product is rejected before backend.
- Updated Desktop README/MCP docs and marked TZD-35 closed by TZD-38.
- No orders/quotes bulk import, EAV, second database, deploy, ZIP publish, or `desktop/mcp-runtime/**` changes.

## Review handoff

- [x] READY FOR REVIEW checkpoint recorded
- [x] Scope review complete; foreign dirty WIP excluded

## Closeout

- [x] Archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-10T19:01:12Z`
