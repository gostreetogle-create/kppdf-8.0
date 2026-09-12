# TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST.md`
> Wave: `docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md` (#1/4)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T20:08:59Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этой сессии)

## Preflight

- [x] `tasks/_active/` перед claim: пусто
- [x] TZ прочитан; `insertCatalogTable` (L1066-1080), `setBlockCatalogSource` (L1115-1141), `commitCatalogSelectionChange` serial pattern (L1834-1887) прочитаны
- [x] Claim slot заполнен

## Acceptance (из TZ)

- [x] Второй Insert того же kind → нет нового table block (spec: `blocksService.create` not called)
- [x] Toast виден (`Таблица «{label}» уже на листе`)
- [x] Если Выбрано непустое и таблица была «пустой» — после Insert строки появляются (`refreshCatalogTablesOfKind` re-puts existing table with fresh revision)
- [x] Specs + nx build green

## Gates (факт)

- `pnpm exec nx test kppdf-web` → 120 suites / 838 tests PASS, 0 fail (includes new `studio-editor-catalog-insert.spec.ts`)
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0, no output
- `pnpm exec nx lint kppdf-web` → 38 pre-existing errors, **none in touched files** (`studio-editor.page.ts` only shows pre-existing warnings at unrelated lines 1485/1486/2438/2548/214; new spec file has 0 issues) — not introduced by this TZ, out of scope (root-scope lint debt across supply/warehouse/studio-table-properties etc.)
- `pnpm exec nx build kppdf-web` → exit 0, Output location `dist/apps/kppdf-web`, same pre-existing budget warnings as baseline

## Executor report

- Changed: `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (`insertCatalogTable`, new `refreshCatalogTablesOfKind` + `hydrateTablesSerially`, `STUDIO_CATALOG_KIND_LABELS`), new spec `studio-editor-catalog-insert.spec.ts`, `docs/pages/document-studio.page.md` §D52 one-liner.
- `hydrateTablesSerially` is the shared serial-putDataSet primitive TZ-HYDRATE-ALL (#2) will reuse for the on-load path.
- No per-table selections, no bake-GET, no S15 expansion.
