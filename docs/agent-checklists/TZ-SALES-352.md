# TZ-SALES-352 checklist — compose / terms / status shame

> Status: **DONE**
> Spec: `tasks/_backlog/kp-vitrine/TZ-SALES-352-kp-compose-terms-status-shame.md`
> Wave: WAVE-KP-SHAME-POLISH

## Claim slot

- agent_id: buffy-sales352
- claimed_at: 2026-08-11T17:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room registry does not know backlog TZ; status/claim attempted)

## Preflight

- [x] Canonical workspace `D:\kppdf-8.0`, branch `main`; TZ-351 remote SHA verified
- [x] `_active-map.md` and `tasks/_active/` checked; no competing claim on TZ-352 keys
- [x] TZ/wave/dependencies read; TZ-351 archive/lock exists
- [x] Claim slot filled; Status = DONE
- [x] `tasks/_active/TZ-SALES-352.md` created before code

## Acceptance

- [x] Empty Состав has RU copy and «Открыть «Товары»» CTA; empty custom name becomes «Своя строка»
- [x] Empty Условия has RU copy, library path, and explicit «Добавить условие» CTA
- [x] Status chrome uses canonical RU labels; «Создать заказ» visible with a Russian disabled reason before «Принято»
- [x] FE tsc PASS; proposal-create + terms Jest 36/36 PASS; changed-file Prettier/ESLint PASS; diff-check PASS
- [x] `docs/pages/proposals-create.page.md` updated with the 352 chrome contract

## Integrity slot

- [x] Type: page / frontend UX polish
- [x] FIC and SECTION-READINESS: N/A — existing `/proposals/create` route and capabilities unchanged
- [x] Page documentation updated; PAGE-TZ-INDEX unchanged because existing proposal-create entry covers the wave
- [x] Foreign WIP excluded; shell 317, backend, PDF, vitrine, and table layout untouched
- [x] DOM self-check PASS through focused page/terms fixtures

## Gates / evidence

- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/commercial/proposals/proposal-create.page.spec.ts src/app/pages/commercial/proposals/proposal-create-terms.component.spec.ts --runInBand --no-coverage` → 36/36 PASS
- [x] Changed TypeScript Prettier → PASS
- [x] Changed TypeScript ESLint → PASS
- [x] `git diff --check` → PASS

## Executor report

- Changed only proposal-create chrome/child components, focused specs, page documentation, and task evidence.
- Team Room status/claim attempted; registry rejected unknown backlog TZ-352.
- No backend, new feature, shell rewrite, deploy, wipe, or unrelated WIP changes.

## Closeout

- [x] `tasks/_archive/2026-08/TZ-SALES-352.done.md` created with ARCHIVE_MARKER
- [x] `.mimocode/locks/TZ-SALES-352-kp-compose-terms-shame.lock` created
- [x] Active marker removed after archive
- [x] Progress, root STATUS, and active-map checkpoint updated
- [x] Commit/push recorded in closeout
- closed_at: 2026-08-11T17:20:00Z
