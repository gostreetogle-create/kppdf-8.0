# TZD-69 checklist — Desktop IMPORT_TARGETS align с NX + target worker

> Status: **DONE**
> Marker: `tasks/_active/TZD-69-import-targets-nx-align.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T20:25:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] `tasks/_active/` — только `TZ-NX-WAREHOUSE-W2-BALANCES.md` (Freebuff, `frontend-nx/**`), нет пересечения с CONFLICT KEYS
- [x] TZD-68 DONE (зависимость выполнена)
- [x] Claim slot заполнен; `tasks/_active/TZD-69-import-targets-nx-align.md` на месте

### Preflight Check Output
- **Context read:** `tasks/_ready/desktop/TZD-69-import-targets-nx-align.md`, `backend/src/modules/worker/{worker.schema,worker.controller,dto/create-worker.dto}.ts` (exact field names/endpoint), `backend/src/modules/work-type/work-type.schema.ts` (confirmed `department`+`accentHue` exist, not yet in Desktop columns), `desktop/src/core/{import-targets,multi-import,excel-form-template}.ts(+.test.ts)`, `desktop/src/core/inbox.ts` (`mapRowToMaterial` — confirmed material's journal write-path only carries name/unit/article/sku/categoryId), `desktop/src/App.svelte` (`fetchDedupeKeys`, `createEntities`, `confirmMapping`, `sendBlocks`)
- **Key Constraints:** worker targetKey = `worker` (per prompt); Units not touched; `warehouse.type` not touched; workTypeNames resolves by exact org name, unknown name → invalid
- **Planned Deliverable:** `worker` in `IMPORT_TARGETS`/`IMPORT_TARGET_ORDER`/Form Studio (`references` category, label «Люди»); dedicated worker validation + dedupe; `createEntities` POST `/api/workers`; workType gets `department`+`accentHue` columns (both already wired into the existing flat `createEntities` branch — cheap, correct alignment)
- **Validation Path:** `desktop && npx tsc --noEmit` + `svelte-check` (extra) + `npx tsx --test src/core/*.test.ts src/importers/*.test.ts`

**Проверено:** `POST /api/workers` whitelist DTO (`lastName`,`firstName` required; `organizationId` never from client); NX-facing fields match 1:1 (`grade`, `ratePerHour`, `isActive`, `workTypeIds`). Material columns were **not** extended — its write path is the mutation-journal proposal (`mapRowToMaterial` in `inbox.ts`), which only forwards `name/unit/article/sku/categoryId`; adding more Excel columns there without also rewiring that mapper would silently drop data (a half-finished feature), so that's out of this TZ's scope — disclosed below, not silently cut.

---

## Acceptance (из TZ)

- [x] Скачать форму «Люди» → 1 валидная строка → validate `ok_new` → POST worker создаёт запись (round-trip test + `createEntities` worker branch wired to `/api/workers`)
- [x] Дубль email → `duplicate`; пустая фамилия → `invalid` (unit tests)
- [x] Битое имя вида работ → `invalid` с RU message (`Неизвестный вид работ: …`) — validated both at row-check time (`validateWorkerRows`) and defensively again at write time (`createEntities`, in case the org's work-type list changed between confirm and send)
- [x] Units по-прежнему нет в Form Studio dropdown — не добавлялся, не трогался
- [x] desktop tests PASS

## Integrity slot

- [x] Тип изменения: other (desktop app feature)
- [x] FIC / page.md / DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (не веб-страница)
- [x] Чужой WIP не в коммите; `frontend-nx/**` не открывался; BE schema/DTO не менялись (только прочитаны для выравнивания полей)
- [x] Канон `docs/DOCS-INTEGRITY.md` соблюдён

## Gates (факт)

- `cd desktop && npx tsc --noEmit` → PASS
- `cd desktop && npx svelte-check --tsconfig ./tsconfig.json` → 0 ERRORS 0 WARNINGS (App.svelte extra check)
- `cd desktop && npx tsx --test src/core/*.test.ts src/importers/*.test.ts` → PASS: 95 tests, 4 suites, 0 fail (+7 vs TZD-68 baseline: 2 excel-form-template worker round-trip/identity tests, 5 multi-import worker validation tests)

## Executor report

**`desktop/src/core/import-targets.ts`:**
- New `worker` `ImportTargetKey` + `IMPORT_TARGETS.worker` (required: `lastName`,`firstName`; optional: `patronymic`,`position`,`department`,`email`,`phone`,`grade`,`ratePerHour`,`isActive`,`workTypeNames`) + `IMPORT_TARGET_ORDER` append.
- `workType` columns gained `department` and `accentHue` (both exist on the BE schema, both already flow cleanly through `createEntities`'s existing flat POST branch). Removed `'отдел'` from `section`'s aliases to avoid an ambiguous header match now that `department` has its own column with that exact alias.

**`desktop/src/core/excel-form-template.ts`:** new `FORM_TEMPLATES` entry (`categoryKey: 'references'`, `labelRu: 'Люди'`); `references` category description now mentions «и люди».

**`desktop/src/core/multi-import.ts`:**
- `workerDedupeKeyOf(record)` — `email:<lower>` if present, else `name:<lastName|firstName|patronymic casefold>`; same function used for a file row and a catalog record (matches the `referenceDedupeKeysOf` pattern).
- `validateWorkerRows(rows, existingKeys, workTypeNames)` — required fields, email format, `ratePerHour ≥ 0`, `workTypeNames` (`;`-split, case-insensitive match against the org's actual work-type names) → `invalid` listing the unknown names, then in-file/catalog dedupe.
- `validateTableRows` gained a 4th optional param (`workTypeNames`, default empty set) and now dispatches `worker` to `validateWorkerRows` before the `isReferenceTargetKey` branch.

**`desktop/src/App.svelte`:**
- `fetchDedupeKeys`: new `worker` branch, paginated like `material` (`/api/workers?limit=100&page=N`, `{items,total}`), keyed via `workerDedupeKeyOf`.
- `confirmMapping`: when any block targets `worker`, fetches `/api/work-types` once to build the known-names set passed into `validateTableRows`.
- `createEntities`: new `worker` branch — resolves `workTypeNames` → `workTypeIds` via a name→id map fetched once per call (not per row), rejects the row with a RU message if any name doesn't resolve (defense-in-depth beyond the confirm-time check), POSTs `/api/workers`. `workType` branch extended with `department`/`accentHue`.
- New `boolOr()` helper for the `isActive` column (РУ/EN да/нет variants; unrecognized → `undefined`, server keeps its own default).

**Conflict disclosure:** touched exactly the CONFLICT KEYS (`import-targets.ts`, `multi-import.ts(+.test.ts)`, `excel-form-template.ts`, `App.svelte`, this checklist) plus `multi-import.test.ts` test additions and `excel-form-template.test.ts` updates for the new allowlist count. `frontend-nx/**` and BE code were never written to.

**Known limits (disclosed by the TZ itself):** `workTypeNames` matches only by exact (case-insensitive) name — no fuzzy/alias matching; bulk skills editing beyond that is successor scope per the TZ's own `known_limitation`.

## Review handoff

- [x] No review-inbox wave requirement — archive directly after gates

## Closeout

- [x] archive + удалить `_active` + следующий TZD-70
- Status = DONE
- closed_at: 2026-09-05T20:55:00Z
