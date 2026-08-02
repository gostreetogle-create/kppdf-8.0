# TZ-DOC-326 — textblock categoryId UI (legacy enum → categoryId) — verification log

## Scope

Frontend-only residual sweep: remove the legacy text-block `category` enum ('legal'|'intro'|'outro'|'custom') from the UI layer after backend TZ-DOC-323 dropped it. Backend untouched.

## Changes

- `pi-text-blocks.service.ts` — removed legacy `TextBlockCategory` enum type, `category` field on `TextBlock`, `category` list param, and the `httpParams.set('category', ...)` network write. Category references now categoryId-only.
- `builder-tool-pane.component.ts` — item hint `@if (t.category)` → `@if (categoryName(t.categoryId); as name)`; added `categoryName()` FK→name lookup.
- `builder.page.ts` — same hint replacement in inline dropdown; inline `textsRes` type `category?` → `categoryId?`; removed unused `PiPageHeaderComponent`/`ButtonComponent` imports (NG8113 warnings inherited from TZ-DOC-324 rewrite).
- Specs: `pi-text-blocks.service.spec.ts` (fixtures + create/update assertions → categoryId), `texts.page.spec.ts` (fixtures), `builder-tool-pane.component.spec.ts` (fixture).

## Verification evidence

| Gate | Result |
| --- | --- |
| frontend `tsc -p tsconfig.app.json --noEmit` | exit 0 |
| backend `tsc -p tsconfig.build.json --noEmit` (sanity) | exit 0 |
| jest targeted (pi-text-blocks, texts.page, text-block-editor, builder-tool-pane, builder.page) | 5 suites / 40 PASS |
| jest full | 898 PASS / 2 FAIL (pre-existing flakes: button.component, pi-showcase-card TZ-PRODUCTS-305 — disclosed) |
| `ng build --configuration=development` | exit 0, 0 warnings |
| `git diff --check` | clean |
| `bash OrchestratorKit/verify-status.sh` | PASS, 0 warnings |
| residual grep `category: 'legal'|'intro'|'outro'|'custom'` / `t.category` / `category?: TextBlockCategory` | 0 hits |

## Executor report (auto) — TZ-DOC-326

status: DONE
commits: <feat-sha> + <closeout-sha>
gates: tsc-fe=PASS; tsc-be=PASS; jest targeted=5/40 PASS; jest full=898 PASS (2 pre-existing flakes disclosed); ng-build=exit 0 (0 warnings); git-diff-check=clean; verify-status=PASS
known: residual grep 0 hits; legacy strings only in backend TZ-DOC-323 docs; Browser E2E=MANUAL_REQUIRED
ask: —
