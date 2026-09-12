# Audit — fresh re-verify: WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA + WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN (2026-09-13)

**Author:** Claude (executor) · **Mode:** verify-only, no product code changed
**Baseline:** `git fetch && checkout main && pull --ff-only` → tip `7479caa7` (matches required tip; confirmed by `git log --oneline -1`)

---

## 1. Evidence read — DoD checkboxes

- `docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md` — 6/6 DoD checkboxes `[x]`, table shows all 4 TZ DONE with SHA `3fd93047 → bd7ed96f → b0258eee → d235f4f1`.
- `docs/agent-checklists/DOCSTUDIO-CATALOG-TABLE-IA-CHECKLIST.md` — all 4 rows DONE, matching SHAs, WAVE COMPLETE note present.
- `docs/agent-checklists/WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN.md` — both TZ DONE with SHA `c9f687e4 → eaa2a1ac`.
- `docs/agent-checklists/DOCSTUDIO-LIST-TEMPLATES-CLEAN-CHECKLIST.md` — both rows DONE, matching SHAs, WAVE COMPLETE note present.

All paper evidence consistent — no discrepancy between wave docs and progress checklists.

## 2. Spot-check code (fresh grep on tip `7479caa7`, not from memory)

| Claim | Evidence |
|---|---|
| `refreshLiveDataSetsOnLoad` → serial, not parallel | `studio-editor.page.ts:1691-1694` — `private async refreshLiveDataSetsOnLoad(...)` body is `await this.hydrateTablesSerially(tables)`, no `void firstValueFrom(...).then(...)` loop left |
| Insert-honest: toast + heal | `studio-editor.page.ts` `insertCatalogTable`: existing branch does `this.toast.success(...«уже на листе»)` then `void this.refreshCatalogTablesOfKind(kind)` before `return` |
| Two distinct RU empty-state texts | `studio-table-defaults.ts:115-132` — `STUDIO_TABLE_EMPTY_NO_SOURCE_LABEL` / `STUDIO_TABLE_EMPTY_LIVE_SOURCE_LABEL`, `studioTableEmptyStateLabel` branches on `studioTableRowSource(block) === 'manual'` |
| Vitrina «Изменить» → heal A4 | `studio-data-vitrina.component.ts:93` (`data-test="studio-data-vitrina-edit"`), `:276` (`catalogEntitySaved` output), `:349` (emits after `reloadKind`); `studio-editor.page.ts:1104-1106` `onCatalogEntitySaved` → `refreshCatalogTablesOfKind(kind)` |
| `/studio` list has no «Новое КП» | `grep -n "createKp\|studio-create-kp\|findKpDocType" studio-list.page.ts` → 0 matches |
| `document-template.findAll` excludes sentinel + deleted | `document-template.service.ts:351-354` — filter literal `{ deletedAt: null, tags: { $ne: BLANK_A4_SENTINEL_TAG }, ... }` |

All 6 claims confirmed present in the actual tip code, not just in commit messages/checklists.

## 3. Focused specs

**Frontend** (`npx nx test kppdf-web --testPathPattern="studio-editor-hydrate-serial|studio-editor-catalog-insert|studio-data-vitrina-edit|studio-blocks-canvas|studio-table-defaults|studio-list" --skip-nx-cache`):
Nx's jest executor does not narrow `--testPathPattern` to a scoped run here (it degenerates into a broad regex and runs the full project) — confirmed via `--verbose` that all 6 named files did execute and **PASS**:
`studio-data-vitrina-edit.spec.ts`, `studio-editor-catalog-insert.spec.ts`, `studio-editor-hydrate-serial.spec.ts`, `studio-list.page.spec.ts`, `studio-blocks-canvas.component.spec.ts`, `studio-table-defaults.spec.ts` — all PASS, within **122 suites / 850 tests (7 skipped), 0 failed**.

**Backend** (`pnpm test -- document-template.sentinel document-template.category`):
**3 suites / 51 tests PASS** (`document-template.sentinel.spec.ts`, `document-template.category.spec.ts`, `document-template-category.service.spec.ts` — substring match pulled in the third, all pass).
Also ran the directly-related `dedup-sentinels` migration spec for completeness: **1 suite / 4 tests PASS**.

## 4. Full gates (fresh, `--skip-nx-cache` where applicable)

| Gate | Result |
|---|---|
| `frontend-nx: tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` | **PASS** — 0 errors |
| `frontend-nx: nx test kppdf-web --skip-nx-cache` | **PASS** — 122 suites / 850 tests, 7 skipped, 0 failed |
| `frontend-nx: nx lint kppdf-web` | **FAIL** — 38 errors / 259 warnings (see §4a) |
| `frontend-nx: nx build kppdf-web --skip-nx-cache` | **PASS** — exit 0, same pre-existing bundle-budget warnings as every prior build in both waves |
| `backend: tsc -p tsconfig.build.json --noEmit` | **PASS** — 0 errors |
| `backend: pnpm test` (full) | **PASS** — 135 suites / 1329 tests, 0 failed |
| `backend: pnpm lint` | **PASS** — exit 0, 0 errors, 202 pre-existing `no-explicit-any` warnings |
| `pnpm architecture:check` (root) | **PASS** — "1487 files; baseline 17; resolved since baseline: 2" |

### 4a. Frontend lint RED — root cause and scope

38 errors are all `@angular-eslint/template` accessibility rules (`click-events-have-key-events`, `interactive-supports-focus`, one `eqeqeq`, one `label-has-associated-control`) plus unrelated `no-unused-vars`, spread across ~10 files: `studio-editor.page.ts` (L214, pre-existing panel-click-stop-propagation div, **not** touched by either wave), `studio-layers-panel.component.ts`, `studio-properties-panel.component.ts`, `studio-table-properties.component.ts`, `studio-text-properties.component.ts`, `studio-workspace-shell.component.html`, `supply-requests.page.ts`, `supply.page.ts`, `storage-items.page.ts`, `warehouses.page.ts`.

Verified line-by-line: **zero of the 38 errors fall in any file either wave actually changed** (`studio-editor.page.ts`'s one error is at line 214, nowhere near the wave's edits at ~126-140/1066-1210/268/1104). Both waves' own checklists (`TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST.md` Gates section, 2026-09-12) already recorded this identical 38-error baseline as pre-existing at the time — this is not a new regression, it predates both waves.

Per this task's hotfix constraint (≤15 lines, on-path to the two waves only): **not eligible for a hotfix** — the fix surface is ~10 files unrelated to catalog-table-IA or list-templates-clean (supply/warehouse pages, unrelated studio panels), and touching them would be exactly the "improve beyond scope" this task forbids. No hotfix applied.

## 5. Verdict

**VERIFY PASS** for both waves' actual deliverables — every spot-checked claim is real in the tip code, every focused spec passes, both full test suites pass fresh (850 + 1329 = 2179 tests, 0 failures), both fresh builds are green, `architecture:check` passes, and neither wave introduced any lint regression.

One gate is red for reasons **unrelated to and predating both waves**: `nx lint kppdf-web` (38 pre-existing accessibility-rule errors in supply/warehouse/other-studio-panel files, 0 in either wave's changed files). Not hotfixed (out of scope, exceeds the 15-line/on-path allowance). A follow-up cleanup TZ is optional and not created automatically per instructions — flagging here for PO triage instead of inventing a deferred TZ file for debt neither wave owns.

No product code was changed by this verification pass.
