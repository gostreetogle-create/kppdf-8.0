# TZD-37 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-37.md` (removed after archive)
> Commit/push: **YES** per wave protocol

## Claim slot

- agent_id: `Buffy/canonical-main`
- claimed_at: `2026-08-10T18:45:35Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` — `Unknown task: TZD-37; sync tasks first`

## Preflight

- [x] Canonical `D:\kppdf-8.0`; current main included the TZD-36 commit before this claim
- [x] Read `_active-map.md` + canonical `tasks/_active/` — empty before claim; TZD-37 keys were free
- [x] Read TZD-37, Excel Studio audit/wave, GEMINI, and executor skill
- [x] Claim slot filled; Status was CLAIMED / IN PROGRESS before product-code edits
- [x] `tasks/_active/TZD-37.md` created before product-code edits
- [x] WAVE-MCP-GAP is DONE; no active parallel GAP claim and `desktop/mcp/src/tools.ts` stayed frozen
- [x] Foreign dirty TZ-AUTH-301/login/PAGE-TZ-INDEX WIP preserved and excluded

## Acceptance

- [x] Excel opens the mapping step; ready mappings are selected, unfit/conflicts are red, and each can be fixed or ignored.
- [x] Confirmation reshapes rows into canonical columns; send controls are only shown after confirmation.
- [x] Multi-sheet Excel selection works; the first non-empty sheet is selected automatically.
- [x] Named org-scoped mapping profiles support save, select, delete, and a single ★ default; a default is applied for matching headers.
- [x] MCP-on «Предложить через ИИ» calls the existing classify tool and returns the map to the same HITL UI; MCP-off is disabled with a Russian hint.
- [x] Row validation exposes `ok_new`, `ok_update`, `skip`, `conflict`, and `error` paths, including duplicate/empty article and quantity evidence; proposals require explicit confirm.
- [x] Existing import/MCP behavior and guarded journal-based SoT apply remain intact.

## Integrity slot

- [x] Тип изменения: desktop UI + backend module + MCP integration
- [x] FIC §A–E: N/A — desktop page is existing; backend profile module is a thin org-scoped CRUD collection, with no new permission/page route
- [x] page.md / PAGE-TZ-INDEX: N/A — desktop app docs are `desktop/README.md` and `desktop/docs/INSTALL.md`
- [x] SECTION-READINESS: N/A — desktop-only product surface
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- `pnpm --dir desktop typecheck` — PASS (exit 0)
- `pnpm --dir desktop check` — PASS, 0 errors / 0 warnings (exit 0)
- `pnpm --dir desktop build` — PASS (exit 0); existing dynamic-import bundler warnings only
- `pnpm --dir desktop mcp:check` — PASS; MCP typecheck PASS and 91/91 tests PASS (27 suites)
- `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` — PASS (exit 0)
- `pnpm --dir backend exec jest src/modules/import-mapping-profile --runInBand` — PASS, 6/6
- `git diff --check` — PASS with existing LF/CRLF normalization warnings only
- Forbidden-path review — PASS; no `desktop/mcp-runtime/**`, deploy, ZIP publish, WAVE-MCP-GAP implementation, Excel/MCP tool-registry changes, or foreign WIP in scope
- Native Tauri smoke — not run in this headless session; Svelte diagnostics and production build pass

## Executor report

- Added reusable multi-sheet Excel parsing and a field-mapping HITL step with canonical columns, red unfit/conflict rows, per-column ignore, and confirmation gating.
- Added organization-scoped `import_mapping_profiles` Nest collection/API with role protection, unique names, profile CRUD, and one-default-at-a-time behavior.
- Added profile persistence wiring, MCP classify suggestion wiring, canonical row reshape, validation statuses, duplicate/empty article and quantity checks, and explicit journal proposal confirmation in Desktop.
- Updated Desktop docs with the mapping/profile flow and TZD-38 boundary.
- Conflict disclosure: only TZD-37 keys were edited; `desktop/mcp-runtime/**`, deploy/ZIP publishing, commercial MCP, BOM composition, Angular web forms, and foreign dirty docs/WIP were not staged.
- Known limits: the MCP suggestion uses the existing classify tool and remains HITL; SoT collision lookup is represented by the local `ok_update` path and needs live catalog lookup in a later hardening pass; native Tauri smoke was unavailable.

## Review handoff

- [x] READY FOR REVIEW evidence recorded in this checklist; automated gates and scope review passed
- [x] Archive allowed after acceptance and conflict review

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-10T18:52:06Z`
