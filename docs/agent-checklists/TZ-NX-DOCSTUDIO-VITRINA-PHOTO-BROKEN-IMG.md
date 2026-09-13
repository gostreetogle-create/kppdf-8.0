# TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md` (3.1)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T14:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — no conflicting `_active` claims besides this one
- [x] TZ read (`tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md`), predecessor
  evidence read (`docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.txt`)
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, predecessor TZ/evidence, `studio-data-vitrina.component.ts`
  (photoUrl/visibleItems/reload*), `pi-showcase-card.component.ts` (full, incl. `size`
  branches), `product.service.ts`/`material.service.ts`/`product-module.service.ts`
  `findAll()`, `document-render.utils.ts`, `studio-data-resolver.ts`,
  `scripts/architecture-check.mjs` (cross-module import rule)
- **Key Constraints:** ШАГ 0 live evidence mandatory before branching fix; backend fix
  preferred (единая точка правды); reuse `localUploadFileExists`, don't re-copy; don't
  touch canvas/resolver (already fixed prior TZ); no mass orphan cleanup
- **Planned Deliverable:** ШАГ 0 evidence + FE-mechanism diagnostic → ШАГ 1 (extract
  public helper, apply to product/material findAll) → ШАГ 2 (client fallback — verify
  existing mechanism, don't duplicate) → ШАГ 3 specs+gates
- **Validation Path:** BE jest (document-render.utils, product.service, material.service,
  studio-data-resolver) + BE full jest/tsc/eslint + architecture:check + FE full
  jest/tsc (no FE code changed) + `nx build kppdf-web` last + live Playwright re-verify

## Evidence (ШАГ 0 + post-fix re-verify)

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.txt`

## Acceptance (из TZ)

- [x] 1. Открыть документ с витриной, где есть orphan-фото → «Нет фото»/плейсхолдер, не
  битая иконка — backend fix (product/material `findAll`), live-подтверждено: 0 битых
  `<img>` (было 21/22), 0 404 (было 34+), без принудительного скролла (точные условия
  исходного репро)
- [x] 2. Существующий рабочий кейс (файл реально есть) — без регресса, миниатюра рендерится
  как раньше — подтверждено (1 img, naturalWidth>0, на вкладках Товары/Детали)
- [x] 3. Specs зелёные; `nx build kppdf-web` last; BE tsc/jest — все PASS, см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: bugfix (single-source-of-truth existence check reused across a third
  call site), не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` — новый абзац сразу после S45
  TABLE-PHOTO-BROKEN-IMG параграфа, закрывает successor-ссылку
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] Чужой WIP не в коммите; conflict keys соблюдены: `document-render.utils.ts`,
  `studio-data-resolver.ts`, `product.service.ts`, `material.service.ts` + их specs +
  page.md + этот checklist/evidence. `studio-data-vitrina.component.ts`/
  `pi-showcase-card.component.ts` **не тронуты** — декларированная девиация от
  буквального ШАГ 2 текста TZ: живая проверка показала существующий FE-механизм уже
  работает корректно (см. evidence), повторная реализация была бы дублированием, не
  фиксом. `product-module.service.ts` (не популейтит фото вообще) — отдельный,
  задокументированный out-of-scope дефект, не тронут.
- [x] Канон: не трогал `studio-blocks-canvas.component.ts`/canvas-путь resolver'а
  (уже чинены прошлой TZ); не чистил orphan Photo docs массово; не трогал upload/multer
  pipeline; не регрессировал wave 1/2 (write-queue, Selected «Изменить», canvas onerror,
  necessity IA/SoT/width — полный FE suite зелёный, их specs не тронуты)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest document-render.utils product.service material.service studio-data-resolver --silent` → 4 suites PASS
- `cd backend && pnpm exec jest --silent` (full) → 135 suites / 1342 tests PASS (was 1330)
- `cd backend && pnpm exec eslint src/modules/document-render/document-render.utils.ts src/modules/document-render/document-render.utils.spec.ts src/modules/studio-document/studio-data-resolver.ts src/modules/product/product.service.ts src/modules/product/product.service.spec.ts src/modules/material/material.service.ts src/modules/material/material.service.spec.ts` → 0 errors (3 pre-existing warnings, unrelated code)
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full, no FE code changed) → 125 suites / 885 passed + 7 skipped PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live Playwright re-verify (local dev, admin/admin123, doc `6aa5b1221b6e6163bba2fc12`, all 4 vitrina tabs) → 0 broken `<img>`, 0 network 404s, no regression on the working case

## Executor report

**Root cause confirmed exactly as the TZ predicted:** `product.service.ts`/
`material.service.ts` `findAll()` populate `photoIds`/`mainPhotoId` with no
disk-existence check, unlike the table canvas/resolver path (already fixed by the
predecessor TZ). Fixed at the single preferred point (backend, "единая точка правды"):
extracted the private `localUploadFileExists` (previously duplicated once already) into
a public `document-render.utils.ts` export, added a `blankMissingUploadUrls` batch
helper (same per-request URL dedup pattern as `resolveCatalogPhotoUrls`), applied to
both list endpoints feeding the vitrina.

**Real diagnostic finding before writing any fix code (ШАГ 0, live evidence):** the
TZ's ШАГ 2 (client-side onerror fallback) turned out to **already exist** in
`pi-showcase-card.component.ts` for exactly the `size="sm"` variant the vitrina uses.
Rather than re-implementing it blindly, forced every `<img>` into view via Playwright
(`scrollIntoViewIfNeeded`, defeating native `loading="lazy"` deferral) and confirmed the
existing mechanism DOES correctly flip to the placeholder once the browser actually
attempts the load — the apparent "it doesn't work" was purely a timing/lazy-load
artifact of a quick settle-and-check, not a defect in the FE code. No FE file touched;
duplicating a working mechanism would have been scope-creep against the project's own
necessity-driven discipline.

**Live re-verification, exact original repro conditions (no forced scroll):** before
fix — 21/22 broken `<img>`, 34 `/uploads/*` 404s. After fix — 0 broken, 0 404s, across
all four vitrina tabs (Товары/Модули/Детали/Материалы), with the one genuinely-existing
photo still rendering correctly (no regression).

**Out-of-scope finding, documented not fixed:** `product-module.service.ts findAll()`
doesn't populate `photoIds`/`mainPhotoId` at all — the "Модули" tab always shows the
empty placeholder regardless of whether a module actually has a photo. Different bug
class (missing feature vs. broken icon), left for a separate TZ per necessity-driven
one-root-cause scope.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T15:10:00Z
