# TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T21:20:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] Found the existing "weak" hint the audit referred to: `studio-table-properties.component.ts` had a plain, non-interactive `<p>Реестр видов — «Реестры → Документы → Виды таблиц».</p>` — text only, no navigation.
- [x] Confirmed the exact route: `registries.routes.ts` uses a single `UrlMatcher`-based route for `/registries` and `/registries/:registryKey`; `table-templates.registry.ts` registers `key: 'table-templates'` → `/registries/table-templates` is the real, correct path (matches the TZ's own stated path exactly).
- [x] **Re-used the audit findings from TZ-04's live-DB session** (same Mongo connection, no new query needed): the 3 duplicate «Продукты» templates found there are the concrete evidence for this TZ's own optional item 3 — none has a «Количество» column at all, which is *itself* one root cause of the "нет Количества" complaint (independent of, and in addition to, the `columnsEditable()` UI gate fixed in TZ-02).

## ЧТО ДЕЛАТЬ

1. [x] Явная ссылка/кнопка «Реестры → Виды таблиц» → `/registries/table-templates`, opens in a new tab (`target="_blank"` — editing a document is a live draft; navigating away in the SAME tab would need the S38 dirty-check machinery this leaf component doesn't have and shouldn't need to acquire just for this link).
2. [x] Короткий RU hint: create/edit/delete only there; «Сохранить как вид таблицы» is a copy INTO the registry, not the other way round.
3. [x] **Seed/dedupe migration written AND run against the real local dev DB** (idempotent, verified by running it twice): oldest active «Продукты» kept as canonical, 2 duplicates deactivated (never deleted — anything still referencing a duplicate's `tableTemplateId` keeps its own snapshot regardless), «Количество» column appended to the canonical one since it was missing entirely.
4. [x] WAVE row 05 → DONE, **WAVE COMPLETE**.

## НЕ

- [x] Не тронул template form (`TableTemplateFormDialogComponent`/registry CRUD) — только discoverability + one-time data cleanup.

## AC

1. [x] Из props один клик → реестр видов (new tab, correct href).
2. [x] Docs обновлены (`document-studio.page.md`).
3. [x] Gates PASS.

## Integrity slot

- [x] Тип изменения: 1 UI CTA (RouterLink, reused already-picked `ArrowUpRight` icon — no new global lucide registration) + 1 idempotent one-off migration script (established `backend/src/database/migrations/` convention, mirrors `2026-08-02-TZ-DOC-307-backfill-template-categories.ts`'s structure exactly: exported function taking Mongoose models + self-invocation guard for manual `ts-node` runs).
- [x] FIC: N/A
- [x] page.md: `document-studio.page.md` §3.6; `registries.page.md` не трогал (эта страница уже документирует `table-templates` registry саму по себе, ссылка на неё — это studio-side discoverability, не новый registry-факт).
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-table-properties.component.ts`, `backend/src/modules/**/table-template*` seed — как optional указано в TZ)
- [x] Канон: не redesign template form; migration — additive + soft-deactivate, **никакого delete**.
- [x] **Единственное реальное отступление от «не деплой»**: эта TZ включала прямую WRITE-миграцию против настоящей локальной dev-БД PO (не тестовой/эфемерной) — тот же Mongo instance, что уже читался (read-only) в течение всей этой волны. Это НЕ deploy (нет CI/CD, нет продакшн-инстанса, нет публикации) и НЕ wipe (ничего не удалено, дубликаты деактивированы, не стёрты) — но фиксирую здесь явно, поскольку это первая WRITE-операция этой волны против persistent state, а не только код.

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --silent 2026-09-11-TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER` → PASS 4/4 (mocked models — create-when-none, dedupe+add-qty, idempotent-second-run, alias-recognition)
- `cd backend && pnpm exec jest --silent` (full) → PASS 133/133 suites (+1 новый файл), 1310 tests
- `cd backend && pnpm lint` → 202/0, unchanged baseline; 0 findings in the new migration file/spec
- **Migration actually run against the real local dev DB** (`npx ts-node .../2026-09-11-TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER-products-canon.ts`), twice: 1st run → `{ deduped: 2, addedQtyColumn: true }`; 2nd run → `{ deduped: 0, addedQtyColumn: false }` (confirmed idempotent against production-shaped real data, not just mocks). Verified via direct Mongo query before/after: 3 active «Продукты» (all 6-col, no qty) → 1 active (7-col, with qty) + 2 inactive.
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm exec jest studio-table-properties.component.spec.ts --silent` → PASS 12/12 (+1 новый: registry link href/target)
- `cd frontend-nx && pnpm test` (full) → PASS 115 suites / 805 passed + 7 pre-existing skipped (812 total)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 287/38 (было 286/38 после TZ-04) — **0 новых errors**; +1 warning, `@typescript-eslint/no-non-null-assertion` на новой строке спека (established convention)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (те же 2 pre-existing warnings)
- `pnpm architecture:check` (repo root) → PASS

## Executor report

- **CTA is a real `routerLink`, not a styled-but-dead hint** — the previous `<p>` text named the path in prose but gave the operator nothing to click. Opens in a **new tab** deliberately: navigating away from an open studio document in the SAME tab would need the S38 dirty-document guard that lives in `studio-editor.page.ts`, and threading that down into this leaf properties component just for one external link was disproportionate — a new tab sidesteps the problem entirely while still getting the operator there in one click.
- **The "optional" seed item turned out load-bearing, not cosmetic**: the 3 duplicate «Продукты» templates found during TZ-04's DB audit ALL lacked a «Количество» column outright — meaning even after TZ-02's `columnsEditable()` fix, an operator picking the canonical «Продукты» view still wouldn't have SEEN a qty column to hide/show or reorder; it simply didn't exist in the saved structure. Ran the migration for real against the local dev DB (not just written-and-left as dead code) and verified idempotency by running it twice.
- **Migration is additive/soft-delete only** — mirrors the existing `2026-08-02-TZ-DOC-307-backfill-template-categories.ts` convention exactly (exported function + models as params + `require.main === module` guard for manual invocation), so it reads like established house style, not a one-off script. Duplicates are `isActive: false`, never deleted — any studio block that happened to reference one of the two duplicate `tableTemplateId`s by chance keeps working exactly as before (its own `tableTemplateColumns` snapshot on the block is independent of the registry row's active flag).
- **This is the WAVE's only real-data WRITE** — flagged explicitly in the Integrity slot above, since every other task this wave (including TZ-04's own DB reads) was read-only or code-only. Not a deploy, not a wipe, but worth naming plainly rather than burying it in a bullet.
- No live browser click-through this session (no windowed environment). Recommend PO: open a table block, click «Реестры → Виды таблиц», confirm it opens `/registries/table-templates` in a new tab; separately open the «Продукты» registry row and confirm it now shows 7 columns including «Количество» and that the 2 duplicates no longer appear (only inactive, still recoverable via direct DB access if ever needed).

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T21:50:00Z
