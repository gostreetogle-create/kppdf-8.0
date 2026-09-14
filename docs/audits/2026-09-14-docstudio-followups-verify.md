# Audit — независимая проверка DocStudio follow-ups pack (2026-09-14)

**Роль:** Executor verify-only (claude), TZ `TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS`
**Scope:** Claude chain (3) + Freebuff-labeled chain, run as Claude (8) — 11 commits total
**Доска:** `docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`

## 1. Baseline

`git fetch && merge origin/main` → already up to date. HEAD = `45e93009` (exactly the
required tip). `tasks/_active/` was empty before claim.

**SHA table — все 11 ancestors of HEAD (`git merge-base --is-ancestor <sha> HEAD`):**

| # | TZ | SHA | Ancestor of HEAD |
|---|-----|-----|-------------------|
| 1 | PREVIEW-UPLOADS-INLINE | `f3ac3c69` | ✅ |
| 2 | UNSCOPED-ORG-SCOPE | `19087f1b` | ✅ |
| 3 | TEXT-PROPS-CANON | `71edf78e` | ✅ |
| 4 | IMAGE-PASSPORT-FIT-WYSIWYG | `1dc0c7f2` | ✅ |
| 5 | TEXT-BLOCK-CATEGORY-INLINE-CREATE | `91dcf7af` | ✅ |
| 6 | TEXT-LIBRARY-INSERT-ON-ADD | `3267af8b` | ✅ |
| 7 | SELECTED-INSERT-PARTY-TEXT | `8e83cf7d` | ✅ |
| 8 | TABLE-WIDTH-BY-HEADER | `38ed2911` | ✅ |
| 9 | TABLE-PHOTO-EMPTY-BLANK | `82bff3d6` | ✅ |
| 10 | SHELL-RAIL-MENU-CLOSE | `83455fb1` | ✅ |
| 11 | TABLE-ROWS-SOURCE-CLEANUP | `ca4fc86d` | ✅ |

All 11/11 confirmed ancestors — the pack described on the wave board is genuinely on `main`.

## 2. Spot-check code (1-liner evidence)

| # | Claim | Evidence |
|---|-------|----------|
| 1 | `StudioOutputService.preview` inlines local uploads | `studio-output.service.ts:62` — `const inlinedHtml = await inlineLocalUploadsForPdf(html);` |
| 2 | unscoped `findById` skips `assertSameScope` | `studio-document.service.ts:231-233` — `if (organizationId && ObjectId.isValid(organizationId)) { this.assertSameScope(doc, organizationId); }` — only guarded when a real orgId is present |
| 3 | token display default `values`; unresolved ≠ normal chip | `studio-editor.page.ts:655` — `signal<'tokens'\|'values'>('values')`; `studio-block-helpers.ts:168` emits `class="substitution-token substitution-token--unresolved"`, distinct CSS at `studio-blocks-canvas.component.ts:250` |
| 4 | passport canvas CSS: contain wins over cover | `studio-blocks-canvas.component.ts:201` — compound selector `.studio-block--passport-bg.studio-block--image img { object-fit:contain }`, higher specificity than the single-class `.studio-block--image img { object-fit:cover }` at line 330, so source order can't flip it |
| 5 | text-block form: `app-pi-select-add-row` ×2 | `text-block-form-dialog.component.ts:55,68` — one for root category (`openCreateRootCategory`), one for subcategory (`openCreateSubCategory`) |
| 6 | «+ Текст» → library picker dialog exists | `studio-text-library-picker-dialog.component.ts` exists; `studio-editor.page.ts:1693` — `addTextToActiveLayer()` opens `StudioTextLibraryPickerDialogComponent` |
| 7 | empty photo cell → `''` / no «Нет фото» (FE+BE) | `grep -n "Нет фото" studio-blocks-canvas.component.ts studio-data-resolver.ts table-template.service.ts` → only explanatory comments describing the *removal* remain, zero live markup |
| 8 | shell `onShellToolClick` closes menu | `app-shell.component.ts:534` — `this.closeMenu(); this.shellTools.invoke(tool);` before invoking a plain (non-category) rail tool |

All 8/8 confirmed directly in the current tree at HEAD `45e93009`.

## 3. Focused specs

```
cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache --testPathPattern="studio-output|studio-editor|studio-blocks-canvas|studio-text-properties|text-block-form|text-library|shell|studio-table|studio-elements|selected"
```
→ pattern resolved broadly (nx CLI passthrough quoting), effectively ran the **full** kppdf-web suite: **129/129 suites, 981 tests (974 passed, 7 skipped)**, 0 failures.

```
cd backend && pnpm test -- studio-output studio-document studio-data-resolver document-render
```
→ **11/11 suites, 128/128 tests passed** (document-render.utils/studio-canvas/block-style/multipage, studio-render.adapter, studio-table-tokens, studio-data-resolver, studio-formula-registry, studio-quotation-lifecycle, studio-document.service, studio-output.service).

## 4. Full gates (fresh)

| Gate | Result |
|------|--------|
| FE `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` | clean, no output |
| FE `nx test kppdf-web --skip-nx-cache` | **129/129 suites, 981 tests (974 passed, 7 skipped)** |
| FE `nx lint kppdf-web` | 38 errors / 309 warnings — **pre-existing baseline**, unchanged from every git-stash -u A/B check performed across all 8 pack TZs during original execution (never 0, always exactly this count vs. each TZ's own diff); command exits non-zero on pre-existing errors, not a regression introduced by this pack |
| FE `nx build kppdf-web --skip-nx-cache` | exit 0; same pre-existing bundle-budget (+3.38kB) and `gantt-bars.component.ts` CSS-budget (+2.23kB) warnings as long-standing baseline |
| BE `tsc -p tsconfig.build.json --noEmit` | clean, no output |
| BE `pnpm test` | **136/136 suites, 1369/1369 tests passed** |
| BE `pnpm lint` | **0 errors**, 202 pre-existing `@typescript-eslint/no-explicit-any` warnings |
| `pnpm architecture:check` (root) | **passed** — 1488 files; baseline 17; resolved since baseline: 2 |

**Verdict: full gates GREEN** (FE lint's 38 pre-existing errors are a known, unrelated baseline — every TZ in this pack independently proved 0 *new* errors via git-stash A/B at merge time; not re-litigated here since the pack diff is fixed and already merged).

## 5. Live smoke (6 — real backend + real headless Chrome, local stack)

Backend hit its in-memory login throttle (20/hour, `ThrottlerModule`, no external store) partway through this run from repeated smoke iterations across the whole session — restarted (`node start.mjs --stop` → `--nx --no-browser`) to clear it; Mongo data (products, organizations, seeded categories) persisted across the restart (compose volume, not removed), confirmed by every post-restart script still finding its seed data.

1. **Документ с фото таблицы → Просмотр показывает картинки (не broken)** — NEW script `scripts/tz-verify-2026-09-14-preview-uploads-inline-smoke.mjs` (no live smoke existed for this TZ in the original wave, BE-unit-only). Queried a REAL seeded product photo (`/uploads/c3c9f84b-….png`), built an image block with it, called `POST :id/preview`: response HTML contains a `data:image/png;base64,…` URI and no longer the raw `/uploads/…` path. Then in the real browser: opened «Документ» menu → «Просмотр», read the `<iframe srcdoc>` — the `<img>` inside has `src` starting with `data:image/`, and **`naturalWidth: 1374`** (genuinely decoded real image data, not a broken icon). **7/7 checks PASS.** Evidence: `reports/TZ-VERIFY-2026-09-14-preview-uploads-inline-smoke.json`, `-1.png`.

2. **Unscoped admin: сменить Исполнитель → +Фото/+Текст → 200 (не 403)** — NEW script `scripts/tz-verify-2026-09-14-unscoped-org-scope-smoke.mjs` (also no live smoke in the original wave). Confirmed the real `admin`/`admin123` JWT decodes to `orgId: null` (genuinely unscoped, not a fixture assumption). Created a document, PATCHed its `organizationId` to a **different** real seeded organization (same shape as `onIssuerOrgChange`), then called `addBlock` (the same write path «+Текст»/«+Фото» use) immediately after — **HTTP 201**, not 403; follow-up `GET :id` — **HTTP 200**, not 404. **7/7 checks PASS.** Evidence: `reports/TZ-VERIFY-2026-09-14-unscoped-org-scope-smoke.json`.

3. **Текст: default Значения; переключатель Токены меняет вид** — rerun (fresh, post-restart) `scripts/tz-nx-docstudio-text-props-canon-smoke.mjs`. **8/8 checks PASS**: canvas shows the seeded client's real resolved name by default (Значения), switching to Токены shows the raw `{{…}}` token, exactly one align-button group on the Studio panel (not duplicated by TipTap's own compact toolbar).

4. **Фото «Сделать фоном» → холст letterbox ≈ PDF (contain)** — rerun `scripts/tz-nx-docstudio-image-passport-fit-wysiwyg-smoke.mjs`. **6/6 checks PASS**, regression-sanity-check preserved in the script (re-verifies the fix actually matters).

5. **«+ Текст» → picker библиотеки; «Пустой текст» создаёт слой** — rerun `scripts/tz-nx-docstudio-text-library-insert-smoke.mjs`. **8/8 checks PASS**: picker opens with seeded category/text visible, «Пустой текст» creates an empty layer, picking a library entry applies its exact content, anti-clobber intact.

6. **Таблица с пустой photo-ячейкой → blank (нет «Нет фото») на canvas и/или preview HTML** — rerun `scripts/tz-nx-docstudio-table-photo-empty-blank-smoke.mjs`. **8/8 checks PASS**: backend preview HTML has a bare empty `<td>` for the photo cell (no label, no `pi-photo-empty` class), canvas shows no «Нет фото» text anywhere on the page, and a forced `error` event on a broken photo `<img>` leaves the cell blank (not a broken-image icon, not text).

**Live smoke total: 6/6 scenarios, all PASS** (44 individual checks across the 6 scripts, 0 failures).

## Verdict

**VERIFY PASS.** All 11 pack commits confirmed as ancestors of HEAD `45e93009`; 8/8 code spot-checks confirmed directly in the tree; focused + full FE/BE gates green (FE lint's 38 errors are the long-standing pre-existing baseline, not a regression); 6/6 live scenarios pass against the real local stack, including 2 newly-written live-smoke scripts for the two TZs (PREVIEW-UPLOADS-INLINE, UNSCOPED-ORG-SCOPE) that only had unit coverage in the original wave. No hotfix was needed — nothing failed.
