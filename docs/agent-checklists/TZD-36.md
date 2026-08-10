# TZD-36 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-36.md` (removed after archive)
> Commit/push: **YES** per wave protocol

## Claim slot

- agent_id: `Buffy/canonical-main`
- claimed_at: `2026-08-10T18:40:21Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` — `Unknown task: TZD-36; sync tasks first`

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0` (canonical main)
- [x] Read `_active-map.md` + canonical `tasks/_active/` — empty before claim; no TZD-36→38 conflict key claimed
- [x] Read TZD-36, Excel Studio audit, wave, GEMINI, and executor skill
- [x] Claim slot filled; Status was CLAIMED / IN PROGRESS before product-code edits
- [x] `tasks/_active/TZD-36.md` created before product-code edits
- [x] WAVE-MCP-GAP is DONE on main (`5888b35d`); no active parallel GAP claim
- [x] Foreign dirty docs (`TZ-AUTH-301`, PO diary, login docs) preserved and excluded

## Acceptance

- [x] Desktop opens with «Импорт Excel» and «MCP» tabs; Import Excel is the default and tab switching keeps stateful pairing/MCP data.
- [x] Import tab makes the dropzone and parsed preview table the primary screen; Inbox is secondary.
- [x] Existing Excel parse and Inbox ImportTask / expert propose / confirm actions remain available.
- [x] MCP tab keeps pairing JSON, connected-user status, host status, Start/Stop, URL, port/LAN, and copy behavior.
- [x] Tauri default window is `1280×800` with `1080×720` minimum.
- [x] Desktop labels and empty states are Russian; README/INSTALL explain the tabs and known TZD-37/38 limits.
- [x] Existing desktop/unit gates remain green.

## Integrity slot

- [x] Тип изменения: desktop UI shell
- [x] FIC §A–E: N/A — existing desktop shell; no web route, permission, BE module, or MCP tool registry change
- [x] page.md / PAGE-TZ-INDEX: N/A — desktop app docs are `desktop/docs/INSTALL.md` and `desktop/README.md`
- [x] SECTION-READINESS: N/A — desktop-only shell
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- `pnpm --dir desktop typecheck` — PASS (exit 0)
- `pnpm --dir desktop check` — PASS, 0 errors / 0 warnings (exit 0)
- `pnpm --dir desktop build` — PASS (exit 0); only existing dynamic-import bundler warnings
- `pnpm --dir desktop mcp:check` — PASS; MCP typecheck PASS and 91/91 tests PASS (27 suites)
- `git diff --check` — PASS
- Forbidden-path review — PASS; no `desktop/mcp/**`, `desktop/mcp-runtime/**`, ZIP publish, deploy, or Excel/MCP-GAP implementation files in scope
- Native Tauri window smoke — not run in this headless session; source-level tab/state wiring and production build verified

## Executor report

- Implemented the two-tab Desktop shell with default «Импорт Excel» studio and separate «MCP» pairing/host surface.
- Added a persistent connected-user chip, wide import dropzone/preview viewport, and responsive two-column MCP layout without changing MCP tools or backend contracts.
- Increased Tauri window from `1100×760` / `800×600` to `1280×800` / `1080×720`.
- Updated `desktop/README.md` and `desktop/docs/INSTALL.md` with the tab workflow and TZD-37/38 boundaries.
- Conflict disclosure: only TZD-36 keys were edited; `docs/PO-DIARY.md`, login/TZ-AUTH-301 files, PAGE-TZ-INDEX, and other uncommitted user WIP were not staged.
- Known limits intentionally deferred: mapping validation/multi-sheet (TZD-37) and BOM hierarchy/composition (TZD-38); native Tauri launch smoke remains for a machine with the desktop runtime.

## Review handoff

- [x] READY FOR REVIEW evidence recorded in this checklist; no separate Cursor/PO visual gate is specified by TZD-36
- [x] Archive allowed after automated gates and scope review

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-10T18:43:36Z`
