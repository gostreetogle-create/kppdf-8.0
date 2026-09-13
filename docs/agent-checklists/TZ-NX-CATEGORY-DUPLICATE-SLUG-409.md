# TZ-NX-CATEGORY-DUPLICATE-SLUG-409 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (2.2)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T19:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date, `_active` empty before claim
- [x] TZ read in full; `category.service.ts` + `category.schema.ts` read in
  full (confirmed two independent unique indexes: compound `{type, slug}`
  and standalone `skuPrefix`, neither guarded)
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, `category.service.ts` (full, `create`/`update`),
  `category.schema.ts` (both unique indexes), `category.service.spec.ts`
  (full, 4 existing tests), `product.service.ts`/`material.service.ts`'s own
  `rethrowDuplicateSku`/`rethrowDuplicate` pattern for style consistency
- **Key Constraints:** conflict keys BE-only; don't change slug DTO
  validation; no auto-suffix retry required (optional, skipped); no wipe
- **Planned Deliverable:** try/catch around `create()`'s `model.create()`
  and `update()`'s `doc.save()`, both delegating to a new
  `rethrowDuplicate()` that distinguishes the two possible unique-index
  collisions by message
- **Validation Path:** BE tsc + BE jest (scoped then full) + eslint (scoped)
  + architecture:check + live curl (both collision types)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.txt`

## Acceptance (из TZ)

- [x] 1. Повторный create с тем же type+slug → **409**, тело/сообщение
  читаемое — live-подтверждено curl'ом
- [x] 2. Spec зелёный — 8/8 PASS (4 новых)
- [x] 3. Живой curl: нет 500 на дубле — подтверждено на ОБОИХ уникальных
  индексах ({type,slug} и отдельно skuPrefix), не только на том, что
  явно упомянут в TZ

## Integrity slot (до READY / archive)

- [x] Тип изменения: error-handling bugfix (500→409), не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: не требуется отдельный абзац — `registries.page.md`'s
  WAVE3.2 секция уже описывает FE-toast поведение при ошибке; этот TZ
  просто делает саму ошибку honest (409 вместо 500), не меняет контракт UI
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (ровно
  `category.service.ts` + `.spec.ts`) + evidence/checklist
- [x] Канон: не трогал slug DTO validation; не добавлял auto-suffix retry
  (опционально, пропущено — честный 409 достаточен); тестовая категория
  удалена сразу после live-проверки (no pollution)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest --testPathPattern="modules/category/category.service.spec.ts$"` → 8/8 PASS (was 4)
- `cd backend && pnpm exec jest --silent` (full) → 135 suites / 1348 tests PASS (was 1344)
- `cd backend && pnpm exec eslint src/modules/category/category.service.ts src/modules/category/category.service.spec.ts` → 0 errors, 3 pre-existing warnings
- `pnpm architecture:check` (repo root) → PASS
- Live curl (local dev): duplicate {type,slug} → 409; duplicate skuPrefix
  (different type+slug) → 409; both readable messages, test category
  cleaned up immediately after

## Executor report

**Root cause confirmed exactly as the TZ described**, plus one thing the
TZ's own reproduction hadn't hit: `skuPrefix` is a SECOND, independent
unique index (not scoped by `type`, unlike `slug`) with the exact same
uncaught-500 bug. Since I was already writing a generic duplicate-key
catch, handling both collision types by inspecting `err.keyPattern` cost
nothing extra and closes a second real 500 the TZ's own evidence hadn't
specifically reproduced — not scope creep, just not leaving an identical
sibling bug unfixed in the same function I was already touching.

**Kept minimal per the TZ's own "НЕ" list:** no slug DTO changes, no
auto-suffix-on-collision retry loop — a clean, correctly-worded 409 is a
complete fix; the FE's inline dialog error display was already confirmed
working in WAVE3.2, so no FE change was needed here either.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T20:00:00Z
