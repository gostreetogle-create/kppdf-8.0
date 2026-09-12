# TZ-NX-DOCSTUDIO-TEMPLATES-NO-SENTINEL-SPAM checklist

> Status: **DONE**
> Wave: `docs/agent-checklists/WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN.md` (#2/2)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T20:39:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Architect gate

`document-template.service.ts` `findAll` has exactly one caller (`document-template.controller.ts` `GET /document-templates`) — safe to add filters there without a second write-path. `ensureBlankA4Sentinel` is called from `blank-a4-template.seed.ts` (boot) and `studio-output.service.ts` (finalize) directly by tag, never through `findAll` — excluding the sentinel from `findAll` cannot break finalize. `autoIndex: !isProd` (`database.module.ts`) — the new unique partial index is dev-only enforcement; the real defense is `ensureBlankA4Sentinel`'s own find-and-dedupe, which works regardless of index enforcement or environment.

## Acceptance (из TZ)

- [x] Admin на чистой БД без user-templates → «Из шаблона»/Шаблоны = honest empty, не 9× «Пустой A4»
- [x] После явного Save as template — одна строка в picker (unaffected — only sentinel/deleted excluded)
- [x] Finalize blank studio doc всё ещё находит sentinel (`ensureBlankA4Sentinel` contract unchanged, only hardened)
- [x] Gates green (backend + frontend)

## Gates (факт)

- Backend: `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- Backend: `pnpm exec eslint <touched files>` → 0 problems
- Backend: `pnpm exec jest` (full suite) → 135 suites / 1329 tests PASS
- Frontend: `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- Frontend: `pnpm exec nx test kppdf-web` → 122 suites / 850 tests PASS
- Frontend: `pnpm exec nx lint kppdf-web` → 0 new issues in touched files
- Frontend: `pnpm exec nx build kppdf-web` → exit 0, same pre-existing budget warnings as baseline
- `pnpm architecture:check` → PASS

## Executor report

**Backend:**
- `document-template.service.ts` `findAll`: always filters `deletedAt: null` + `tags: { $ne: BLANK_A4_SENTINEL_TAG }`, org/docType/isDefault/category scope unchanged.
- `ensureBlankA4Sentinel`: rewritten to call new `findAndDedupeBlankA4Sentinel` (finds all non-deleted sentinels for the org, keeps oldest, soft-deletes extras) before deciding to create; `create` wrapped to catch an 11000 duplicate-key race and re-find instead of throwing.
- `document-template.schema.ts`: unique partial index `{organizationId, tags}` scoped to the sentinel tag + `deletedAt: null` (dev-only enforcement, `autoIndex` off in prod).
- New one-shot migration `database/migrations/2026-09-12-*-dedup-sentinels.ts` (manual `ts-node` invocation, same convention as the 2026-09-11 products-canon migration) for a live DB with pre-existing duplicates, so the new unique index builds cleanly.
- New spec `document-template.sentinel.spec.ts` (findAll filter shape, create/no-op/dedupe/race paths) + migration spec; fixed one pre-existing `document-template.category.spec.ts` assertion to the new base filter shape.

**Frontend:**
- `studio-list.page.ts`: unified both "no templates" toasts into one exported `STUDIO_NO_SAVED_TEMPLATES_MESSAGE` honest copy.
- `studio-templates-list.page.ts`: empty-state text now the same honest copy (imported from `studio-list.page.ts`).
- Specs updated/added for both empty-state copies.

**Docs:** `document-studio.page.md` §3.4 — sentinel is internal/finalize-only, never shown in the UI list; dedup + index behavior noted.

Did not touch the sentinel finalize mechanism's contract, hard-wipe the templates collection, or add auto-save-on-editor-close.
