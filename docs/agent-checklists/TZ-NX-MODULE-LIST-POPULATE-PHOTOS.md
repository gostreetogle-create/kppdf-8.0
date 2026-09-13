# TZ-NX-MODULE-LIST-POPULATE-PHOTOS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (2.1)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T19:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date, `_active` empty before claim
- [x] TZ read in full; `product-module.service.ts` read in full (confirmed
  `findAll`/`findById`/`findByIds` all miss photoIds/mainPhotoId populate);
  cross-checked FE `PiModulesService.list()` → `GET /modules` → `findAll()`
  (not `findById`) to confirm scope
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, `product-module.service.ts` (full),
  `product-module.service.spec.ts` (full, 21 existing tests), WAVE3.1
  evidence (`blankMissingUploadUrls` origin), `document-render.utils.ts`
  helper signature
- **Key Constraints:** conflict keys BE-only (`product-module.service.ts` +
  `.spec.ts`); reuse `blankMissingUploadUrls`, no third copy; don't touch
  `findById` (used for mutate-then-save internally, and vitrina doesn't
  call it); no mass Mongo cleanup; no FE rewrite
- **Planned Deliverable:** populate photoIds/mainPhotoId on `findAll`'s both
  branches, switch to `.lean()`, apply `blankMissingUploadUrls`, specs, live
  smoke (negative + positive path)
- **Validation Path:** BE tsc + BE jest (scoped then full) + eslint (scoped)
  + architecture:check + live Playwright (orphan-free negative check +
  temporary real-photo positive check, reverted after)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.txt`

## Acceptance (из TZ)

- [x] 1. Модуль с существующим uploads-файлом → миниатюра в витрине —
  live-подтверждено (временный PATCH на реальный файл → img_count 1, ok,
  затем откат)
- [x] 2. Orphan photoId → placeholder, 0×404 на вкладке — live-подтверждено
  (0 img/0 broken/0×404 на исходном датасете без фото) + spec (orphan
  storageUrl blanked)
- [x] 3. Specs + BE tsc/jest zone — PASS, см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: missing-populate bugfix, не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: не требовалось отдельного абзаца — тот же контракт, что уже
  описан для product/material в WAVE3.1 (`document-studio.page.md`'s
  "Витрина... закрыта" параграф); поведение модулей теперь просто
  соответствует этому же описанию, а не отдельному новому контракту
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (ровно
  `product-module.service.ts` + `.spec.ts`) + evidence/checklist
- [x] Канон: не трогал `findById`/`findByIds` (out of scope, объяснено в
  evidence); не чистил Mongo Photo массово; не переписывал FE showcase;
  тестовый PATCH на реальный документ откачен сразу же (no pollution)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest product-module.service --silent` → 23/23 PASS
- `cd backend && pnpm exec jest --silent` (full) → 135 suites / 1344 tests PASS (was 1342)
- `cd backend && pnpm exec eslint src/modules/product-module/product-module.service.ts src/modules/product-module/product-module.service.spec.ts` → 0 errors, 21 pre-existing warnings
- `pnpm architecture:check` (repo root) → PASS
- Live Playwright (local dev, admin/admin123): negative path (no photos,
  0 broken/0×404) + positive path (temporary real-photo PATCH → renders,
  reverted) — both PASS, 0 page errors

## Executor report

**Root cause confirmed exactly as the TZ described:** a missing-populate
bug, not the orphan-reference broken-icon class WAVE3.1 already closed for
product/material. Fix reuses the exact same `blankMissingUploadUrls` helper
from that TZ — no third copy-pasted existence-check implementation.

**Scope discipline:** `findById`/`findByIds` deliberately left untouched —
confirmed via FE trace that the vitrina's "Модули" tab calls `findAll()`
only, and `findById()` is used internally for mutate-then-`.save()` flows
where populating a ref field carries real (if usually safe) risk around
Mongoose's populate/save interaction. Not worth the risk for a code path
the TZ never asked to fix.

**Live proof of the positive path (not just the negative one):** the shared
dev dataset had zero modules with an actual photo, so a plain negative-only
check (no broken icons) wouldn't have proven the fix actually renders a
real photo when one exists. Temporarily PATCHed one existing module to
reference a file already known-good from WAVE1 evidence, confirmed the
vitrina now shows it, then reverted the module to its original empty state
— no lasting change to shared data.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T19:35:00Z
