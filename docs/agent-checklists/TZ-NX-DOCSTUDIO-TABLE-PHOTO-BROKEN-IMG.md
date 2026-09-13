# TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md` (1.1)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T09:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — no conflicting `_active` claims
- [x] TZ read, related prior TZ read (`TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE.md` — orphan-photo fix already shipped, this TZ is the remaining broken-icon case)
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** `tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md`, `docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE.md`, `docs/pages/document-studio.page.md` (§фото), `backend/src/modules/studio-document/studio-data-resolver.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts`, `backend/src/modules/document-render/document-render.utils.ts`
- **Key Constraints:** Claim done · conflict keys = resolver/canvas only (no editor overlap with 1.2/1.3) · evidence-first (ШАГ 0 mandatory before branching fix)
- **Planned Deliverable:** ШАГ 0 evidence → ШАГ 1 (unify disk-check helper with write path) → ШАГ 2 (canvas onerror fallback) → ШАГ 3 only if evidence shows real-file 404/401
- **Validation Path:** BE jest `studio-data-resolver` + FE `studio-blocks-canvas.component.spec.ts` + `nx build kppdf-web` last

## Evidence (ШАГ 0, ≤15 строк; verbatim → evidence/)

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.txt`

## Acceptance (из TZ)

- [x] 1. Evidence: URL + HTTP status + disk + photoIds для кейса 356/021 — см. evidence/, SKU 356/021 сейчас грузится корректно (200), не воспроизводится в текущем состоянии
- [x] 2. Orphan/missing file → «Нет фото» на canvas и preview (не broken icon) — уже покрыто TABLE-PHOTO-SMOKE server-side; не регрессировало
- [x] 3. Canvas: img load error → «Нет фото» — новый `(error)` handler + `failedPhotoUrls` signal, spec добавлен
- [x] 4. `UPLOAD_DIR` custom → existence check согласован — новый `resolveUploadsRoot()` shared helper, spec с custom UPLOAD_DIR добавлен
- [x] 5. Specs + BE jest studio-data-resolver + FE canvas spec; `nx build kppdf-web` last; BE tsc — все PASS, см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: bugfix (defensive rendering + path-resolution consistency), не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` — новый абзац перед §S45 «Таблицы на холсте» (после §S48 фото-контракта)
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только resolver/document-render.utils/canvas + их specs + page.md)
- [x] Канон: не трогал upload pipeline/multer/category forms; не трогал `studio-data-vitrina.component.ts` (out of scope, successor filed)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest --silent studio-data-resolver document-render.utils` → 2 suites / 31 tests PASS
- `cd backend && pnpm exec jest --silent` (full) → 135 suites / 1330 tests PASS
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-data-resolver.ts src/modules/studio-document/studio-data-resolver.spec.ts src/modules/document-render/document-render.utils.ts` → 0 problems
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec jest studio-blocks-canvas.component.spec.ts --silent` → 12/12 PASS
- `cd frontend-nx && pnpm test` (full) → 123 suites / 852 passed + 7 skipped (859 total) PASS
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` → 0 errors, 19 pre-existing-pattern warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0

## Executor report

**Evidence-first result (ШАГ 0):** live Mongo query for SKU `356`/name `021` (product
`6a94388aeefec33de256ac35`, mainPhotoId `6aa5ac581b6e6163bba2f802`) → Photo doc
`storageUrl: /uploads/c3c9f84b-...png`, file confirmed on disk, direct backend fetch
200. This exact reported row is **not currently reproducing** a broken icon in the
table canvas — the PO's original screenshot most likely reflects a transient state
(upload completing after the screenshot) or, more likely per the finding below, the
catalog-browsing vitrina rather than the canvas itself.

**Real, bigger, but out-of-scope finding:** a live Playwright pass of the same
studio document found 22 of 23 `<img>` elements on the page genuinely broken (404),
but every one of them lives inside `pi-studio-data-vitrina`/`app-pi-showcase-card`
(the "Товары" catalog picker) — a different component with its own client-side-only
photo resolution (`studio-data-vitrina.component.ts`'s `photoUrl()`), never covered
by TABLE-PHOTO-SMOKE's backend existence check and not in this TZ's conflict keys.
Filed as `tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md` rather than
silently expanding scope.

**Fixes actually made (both unconditional per TZ's ACCEPT, not evidence-gated):**
1. `resolveUploadsRoot()` — new shared helper in `document-render.utils.ts`,
   mirroring the write path's `UPLOAD_DIR ?? './uploads'` fallback exactly. Both
   `studio-data-resolver.ts`'s existence check and the PDF inliner used to
   hardcode `process.cwd()/uploads` independently — coincidentally correct on
   this deploy (`UPLOAD_DIR` is never set in `docker-compose.prod.yml`) but a
   real latent inconsistency, now a single source of truth. New spec proves a
   file placed only under a custom `UPLOAD_DIR` is found.
2. Canvas `(error)` fallback: a `failedPhotoUrls` signal on
   `StudioBlocksCanvasComponent`, set once a photo `<img>` fails to load,
   downgrading that cell to the same «Нет фото» state as an empty cell — never
   a permanent raw broken-image icon regardless of *why* the URL failed
   (mid-upload race, dev-server restart, or the vitrina-class bug above if it
   ever also affected canvas rows).

**Step 3 (nginx/absolute-URL branch) explicitly NOT taken:** evidence showed no
404/401 due to auth on the canvas's own photo path — direct backend fetch of the
target file returned a clean 200, and CSP/static-serve config has no device-gate
on `/uploads/*`. Not a guess — a live check ruled it out.

**Not touched (per TZ "НЕ ИЗМЕНЯТЬ"):** photo upload/multer, category forms, any
Create-КП legacy table code, `studio-data-vitrina.component.ts` (successor filed
instead of scope creep).
