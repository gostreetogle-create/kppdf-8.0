# TZ-NX-REGISTRY-PRODUCT-FORM-UX checklist

> Status: **DONE**
> Wave: A1 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`
> Marker: none (verification-only closeout, claim+close in one pass)
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit+push this step

## Claim slot

- Implementation: `agent_id: gemini`, `claimed_at: 2026-08-30T14:22:00+03:00` (see original spec `tasks/_archive/2026-08/specs-dup-root/TZ-NX-REGISTRY-PRODUCT-FORM-UX.md`) — code was already correct in the working tree, never committed.
- Independent live verification + closeout: `agent_id: claude`, `claimed_at: 2026-08-30T14:55:20Z`, `workspace: D:\kppdf-8.0`, `team_room_claim: unavailable (not attempted — verification-only pass)`.

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:\kppdf-8.0`, branch `main`
- [x] Read `_NOW.md` + `tasks/_active/` — empty, no competing CLAIM on this file/keys
- [x] TZ read: `tasks/_archive/2026-08/specs-dup-root/TZ-NX-REGISTRY-PRODUCT-FORM-UX.md` (A1, `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`)
- [x] Code diff read (`git diff` on both files) — confirmed narrowly scoped to A1, no unrelated changes mixed in

## Acceptance (from TZ, verified live against running :4201/:3000, not just code review)

- [x] 1. Диалог create/edit: заголовок секции «Изделие», нет текста «Паспорт изделия» — screenshot `03-product-create-dialog.png` (Playwright, admin session)
- [x] 2. `grep product-passport-preview` в `product-form-dialog.component.ts` = 0 matches (import + usage both removed)
- [x] 3. Подсказка «Комплекс — когда в состав входят другие изделия…» рендерится в create-режиме до сохранения — visible in same screenshot
- [x] 4. Описание + Заметки в 2 колонки на `md:` — confirmed in template (`grid md:grid-cols-2`) and screenshot
- [x] 5. Gates green (see below)

## Integrity slot

- [x] Тип изменения: **page** (registries → product form dialog)
- [x] FIC §A–E: N/A — no new route/nav, no permission/role change, no backend module/API change, no MCP surface touched; pure existing-page form markup
- [x] `docs/pages/registries.page.md` updated — line 117 (`product-passports` row) no longer describes a "computed preview in product dialog" that doesn't exist anymore
- [x] SECTION-READINESS — N/A (no section-readiness ledger entry for this page)
- [x] Чужой WIP не в коммите — staged only: `product-form-dialog.component.ts`, `.spec.ts`, this checklist, the archive file, `docs/pages/registries.page.md`, `_NOW.md`. Left untouched: auth/rbac, docker-compose, MASTER-CORE docs, constructor deletions, studio/**, other registries dialogs.
- [x] Coupling map — N/A (no shared/common field or cross-page status touched)

## Build integrity

- [x] `pnpm exec nx build kppdf-web` → exit 0 (Nx cache-valid, "Successfully ran target build for project kppdf-web and 4 tasks it depends on")
- [x] No other `tasks/_active/*` touching `apps/kppdf-web/src/**`
- [x] Closing build run was the actual command above (not stale cache claim from prior session)

## Gates (factual)

```
pnpm exec nx build kppdf-web
  → Successfully ran target build for project kppdf-web and 4 tasks it depends on. Exit 0.

pnpm exec nx test kppdf-web --testPathPattern=product-form
  → (nx passed the pattern through as a broad regex; full kppdf-web suite ran)
  → Test Suites: 46 passed, 46 total. Tests: 252 passed, 7 skipped, 259 total. Exit 0.

pnpm exec eslint apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts
  → 0 problems. Exit 0.
  (Whole-project `nx lint kppdf-web` has 4 pre-existing errors + 70 warnings, all in
  studio/** and unrelated spec files — none in the files this TZ touches. Not this
  TZ's scope; belongs to Phase B / B3 polish.)
```

## Executor report

- What was verified: code for A1 was already correct (implemented by Gemini earlier the same day, uncommitted). I independently re-verified against the *running* dev server (`http://127.0.0.1:4201`, backend `:3000`) via a Playwright script (Python venv at `.logs/venv`, reusing the pattern from prior `.logs/shoot*.py` sessions) — logged in as `admin`, opened "Создать изделие", confirmed no passport preview, confirmed the derived-Complex hint text, confirmed description/notes are side-by-side. Screenshots saved to session scratchpad (not committed — diagnostic evidence, not a repo artifact).
- Also swept every module (21/21) and product (68/68) composition+tree endpoint directly against the backend API for 4xx/5xx — all clean 200s once paced under the Throttler limits (`app.module.ts`: short 10/1s, long 100/60s). This refutes a separately-reported "BSONError on module composition" as *currently* reproducible; noted for the team but out of scope for this TZ's commit.
- Known limits: did not re-verify edit-mode (only create-mode) live; did not test isComplex badge end-to-end (that's A5's scope per the wave doc, not A1's).
- Conflict disclosure: touched only the 2 files above scoped to A1, `docs/pages/registries.page.md` (1 line), this checklist, and `_NOW.md`/archive bookkeeping. Left all other uncommitted WIP in the tree untouched.

## Review handoff

- No wave inbox review configured for this TZ; PO verdict is the live browser audit itself (`tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`), which this checklist provides evidence against.

## Closeout

- [x] archive updated: `tasks/_archive/2026-08/TZ-NX-REGISTRY-PRODUCT-FORM-UX.done.md`
- [x] `_NOW.md` synced
- Status = DONE
- closed_at: 2026-08-30T14:55:20Z
