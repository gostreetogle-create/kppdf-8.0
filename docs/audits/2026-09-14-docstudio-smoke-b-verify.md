# Audit — smoke-B: добить live smoke pack + successors (2026-09-14)

**Роль:** Executor verify-only (claude), TZ `TZ-VERIFY-2026-09-14-DOCSTUDIO-SMOKE-B`
**Зависимость:** `TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS` = VERIFY PASS (`2eb4a4d9`)
**Доска:** `docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`

## Baseline

`git fetch && merge origin/main` → already up to date, HEAD = `2eb4a4d9` (= required tip). `tasks/_active/` was empty before claim. Local stack (Docker Mongo + backend + frontend-nx) was already up from the prior VERIFY-A session; login confirmed working (200) — no throttle hit this time.

## 1. Обязательные 5 smoke-скриптов (перегнаны fresh)

| # | Script | Result | Checks |
|---|--------|--------|--------|
| 1 | `scripts/tz-nx-text-block-category-inline-create-smoke.mjs` | **PASS** | 11/11 |
| 2 | `scripts/tz-nx-docstudio-selected-insert-party-text-smoke.mjs` | **PASS** | 6/6 |
| 3 | `scripts/tz-nx-docstudio-table-width-by-header-smoke.mjs` | **PASS** | 7/7 |
| 4 | `scripts/tz-nx-shell-rail-menu-close-smoke.mjs` | **PASS** | 5/5 |
| 5 | `scripts/tz-nx-docstudio-table-rows-source-cleanup-smoke.mjs` | **PASS** | 10/10 |

**5/5 required scripts PASS, 39/39 individual checks, 0 failures.** All ran against the real local backend + real headless Chrome, no stale-report reuse — genuinely re-executed this session.

## 2. Successors regression (3/3 — exceeds the ≥2/3 minimum)

New combined script: `scripts/tz-verify-2026-09-14-smoke-b-successors.mjs`. Two script-authoring bugs were found and fixed while writing it (both in the *verification script*, not product code — logged here for transparency, not as product findings):
- `putDataSet`'s `dataSet` body needs an explicit `source: {type: 'catalog-products'}` field — `ensureTableDataSetsFromBlocks` (backend) only synthesizes a `manual` dataSet entry when none exists yet; `block.settings.dataSource` alone does **not** wire a table to a live catalog source, only a real `dataSet` entry with its own `source` does. Confirmed via a manual curl-equivalent repro before fixing the script.
- `app-pi-select`'s listbox panel is `[hidden]="!open()"` (stays in the DOM, CSS-hidden) — reading `.textContent` on the whole select wrapper picks up every option's text regardless of open state; fixed by reading only `app-pi-select-trigger`'s own text. Also: a synthetic `dispatchEvent('click')` on a listbox option did not register with this CDK-driven component (same class of issue seen earlier in the wave for other Angular/CDK targets) — fixed by using a real CDP `Input.dispatchMouseEvent` at the option's own screen coordinates instead.

| # | Successor | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Issuer select: switching «Исполнитель» persists (PATCH 200, no 403) — UI select shows the value | **PASS** (4/4 checks) | Real `isOurCompany`-flagged org fetched live; opened Данные→Ещё, read the select's placeholder state, clicked a real option (CDP mouse click), confirmed `contextSaving` round-trip; **then did a full page reload** and re-read the select — still shows the new org (`F5 UI`), and a fresh `GET` on the document confirms `organizationId` genuinely changed server-side. Screenshots: `reports/TZ-VERIFY-2026-09-14-smoke-b-1-issuer-before-reload.png`, `-2-issuer-after-reload.png`. |
| 2 | Table price/sum: `listPrice`-aliased `price` column + `sum` column, non-empty/non-duplicate, on a real seeded product | **PASS** (4/4 checks) | Wired a table (`dataSource: catalog-products`, columns name/qty/price/sum) to product «021» (`listPrice: 300`) via `context.catalogSelections.products` + a real `PUT :id/data-sets/:key`; backend `/preview` HTML row resolved to `021 \| 1 \| 300 \| 300` — price genuinely pulled from `listPrice`, sum genuinely computed (`qty × price`), neither empty nor a label duplicate. |
| 3 | Canvas token chip: `{{token}}` renders as a `.substitution-token` chip in Токены mode (switched from default Значения) | **PASS** (5/5 checks) | Created a text block with raw `{{counterparty.name}}`; default load already shows the `--unresolved` variant chip (values mode); double-clicked the block to open Свойства (`TZ-NX-PO-SWEEP-02` double-click contract, same as every other block-Properties smoke in this wave), clicked «Токены» — the span now carries the plain `substitution-token` class (no `--unresolved`), confirming the two visually-distinct variants documented in `TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON`. Screenshot: `reports/TZ-VERIFY-2026-09-14-smoke-b-3-token-chip.png`. |

**Successors: 3/3 PASS (17/17 individual checks).**

## 3. VERIFY-A scripts re-run (optional one-shot, time permitted)

Skipped — time was spent on the mandatory 5 + all 3 successors (exceeding the AC's ≥2 minimum) plus debugging the two script-authoring issues above. VERIFY-A's own audit (`docs/audits/2026-09-14-docstudio-followups-verify.md`, `2eb4a4d9`) already covers those 6 scenarios with fresh reruns from the same session lineage; not re-litigated here per the TZ's own "skip with a note" allowance.

## Verdict

**VERIFY PASS.** All 5 required smoke scripts pass fresh (39/39 checks); all 3 successor regressions pass (17/17 checks, exceeding the ≥2/3 AC). No hotfix needed — every failure encountered during this session was in the verification script itself (missing `source` field on the dataSet PUT, wrong selector reading a hidden-but-present listbox, a `.body` unwrap miss, a synthetic-click reliability issue), never in product code; each was found, understood via a byte-for-byte repro, and fixed in the script before re-running to a clean pass.
