# TZ-NX-PRE-UAT-SMOKE-2026-09-12 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-PRE-UAT-SMOKE-2026-09-12.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T01:00:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] API (:3000) already healthy; NX frontend (:4201) not running — started via `node start.mjs --nx --no-browser` (additive, reuses healthy backend, no `--reset`/wipe).
- [x] Reused the exact raw-CDP pattern from `scripts/tz-nx-hub-05-visual-parity-smoke.mjs` (WebSocket over Chrome remote-debugging-port, no puppeteer dep) — same login-and-seed-tokens approach, same `check()`/screenshot()` helpers.
- [x] Traced real `data-test` selectors for every check (registries category groups, category-type select, material-form categoryId select, studio shell-tool-right chrome rail, layer-row properties button, table props panel class, quick-add chip, photo cell classes, put-on-stock material search) via source grep before writing a single assertion — no guessed selectors.
- [x] Decided to create ONE disposable studio document + table block via the API for checks 6/7, rather than reuse an existing PO document — found the existing "КП 11.09.2026 (2)" document's «Продукты» block has stale `liveRows` (3 cells) against 6 current columns (pre-dates the S47/LINE-QTY/PHOTO-SMOKE fixes, never retroactively rehydrated) — using it would have made the smoke's pass/fail depend on unrelated old-data hygiene, not on this session's code. Documented as a non-blocking side finding in the audit, not fixed (no FAIL evidence tying it to this wave's code).
- [x] Confirmed via direct API query that TZD-05's earlier migration (`TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER`, prior wave) is still holding: exactly one active «Продукты» template (`6a6ced0f...`, 7 columns incl. qty), two duplicates still deactivated.

## ЧТО ДЕЛАТЬ

1. [x] Stand: API health confirmed, NX started and polled until 200.
2. [x] Gates B run for real: backend tsc/test, frontend-nx test/build, repo-root architecture:check.
3. [x] Wrote and ran `scripts/pre-uat-smoke-2026-09-12.mjs` — 18 real DOM/console assertions across all 9 TZ table rows (row 9 folded into each navigation as a console-error check rather than one final aggregate, since errors need to be captured per-page to attribute them correctly).
4. [x] FAIL → fix: **none needed** — all 18 checks passed on the first full run. One harmless bug in my OWN script (DELETE response has no body; `res.json()` threw "Unexpected end of JSON input" on cleanup) — fixed (`apiJson` now only parses when there's response text) and re-verified with a clean second run, 18/18, no warnings.
5. [x] Section D (tests for gaps): evaluated the 3 priority items explicitly named in the TZ (registries categories select, studio table props width/qty unlock, nav no-reference) — all three already have dedicated unit coverage from their originating waves, and `nav-categories.spec.ts`'s exact-order `NAV_CATEGORY_ORDER` assertion already regression-locks the "no reference chip" outcome. No new test added — would have been redundant coverage, not a real gap.
6. [x] Section E (Desktop, optional): re-ran typecheck + full `tsx --test` suite (174/174) — still green, no Ollama needed (already established prior wave).
7. [x] Audit written: `docs/audits/2026-09-12-pre-uat-smoke.md` — PASS/FAIL/SKIP table, evidence links, "PO может не кликать" / "PO смотри глазками" split, the one side-finding documented separately from the checklist itself.
8. [x] WAVE row DONE; archive; `_NOW` → IDLE.

## НЕ

- [x] Не wipe (`start.mjs --nx --no-browser`, no `--reset`); не deploy; не Soup train; не TZD-76; не «продолжать?» (fully autonomous per UNATTENDED contract); не чинил the stale-liveRows side finding without FAIL evidence tying it to THIS wave's code (it predates all the relevant fixes); не полный UX-sweep (only the 9 rows named in the TZ, nothing extra).

## AC

1. [x] Audit markdown + evidence folder exist (`docs/audits/2026-09-12-pre-uat-smoke.md`, `docs/audits/evidence/pre-uat-2026-09-12/` — 8 PNGs + report.json).
2. [x] Smoke script runnable: `node scripts/pre-uat-smoke-2026-09-12.mjs` → exit 0, 18/18 PASS.
3. [x] Gates B: all PASS on first run, no fix needed.
4. [x] No «Справ.» chip (check 1); registries IA (checks 2a-2c) + studio table qty/photo (checks 6b/6c/7) all asserted in the CDP smoke.
5. [x] Executor report below: SHA + "что PO не обязан перепроверять".
6. [x] TZ archived; `_NOW` → IDLE.

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm test` → PASS 133/133 suites, 1310 tests
- `cd frontend-nx && pnpm exec nx run kppdf-web:test --skip-nx-cache` → PASS 115/115 suites, 805 passed + 7 pre-existing skipped
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (2 pre-existing warnings, known)
- `pnpm architecture:check` (repo root) → PASS
- `cd desktop && pnpm run typecheck && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → PASS (174/174), optional Section E
- `node scripts/pre-uat-smoke-2026-09-12.mjs` → **PASS, 18/18 checks, 0 FAIL, 0 SKIP**, run twice (second run confirms the cleanup-warning fix and stays 18/18)

## Executor report

- **Zero FAILs across everything** — the four preceding waves (DROP-REFERENCE-NAV, REGISTRY-CATEGORIES, DOCSTUDIO-TABLE-PROPS, AI-IMPORT-BASELINE) already left the codebase in a genuinely working state; this smoke's job was to VERIFY that with fresh eyes/tools rather than trust the prior waves' own self-reported gates, and it checks out end-to-end through a real browser, not just unit mocks.
- **Deliberately built the smoke's own disposable fixture** instead of depending on PO's real test documents — found and documented (not fixed) a stale-data artifact in one of PO's own documents (a table block referencing since-deactivated duplicate template, with liveRows cached before this session's rehydration fixes existed). This is exactly the kind of thing worth a "PO смотри глазками" note rather than an unrequested fix — it predates every relevant code path this session touched, so there's no FAIL evidence connecting it to this wave's code.
- **Found and fixed one bug — in the smoke script itself**, not the product: `DELETE` responses have no body, and the script's own `apiJson()` helper unconditionally called `.json()`, throwing a cosmetic (non-fatal) warning on cleanup. Fixed to only parse when there's actual response text; re-ran clean.
- **No new tests added** — checked the three priority items the TZ names explicitly and confirmed each already has real unit coverage from its own wave, plus `nav-categories.spec.ts`'s exact-order assertion already regression-locks "no reference chip". Writing a parallel test for something already covered and already passing would be exactly the kind of unrequested scope the WAVE explicitly excludes.
- Screenshots visually spot-checked (not just the JSON assertions) for checks 4 and 6: the details-create dialog shows a real required `<select>` for «Категория» with a "— выберите —" placeholder; the studio table-properties panel is visibly ~820px wide with all 7 columns (including the newly-added `qty`/«Количество») and working ↑↓ reorder buttons.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12T01:45:00Z
