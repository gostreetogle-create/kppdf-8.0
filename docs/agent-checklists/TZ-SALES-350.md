# TZ-SALES-350 checklist — proposals list shame RU

> Status: **DONE**
> Spec: `tasks/_backlog/kp-vitrine/TZ-SALES-350-proposals-list-shame-ru.md`
> Wave: WAVE-KP-SHAME-POLISH

## Claim slot

- agent_id: buffy-sales350
- claimed_at: 2026-08-11T16:32:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room registry does not know backlog TZ; join/inbox/status completed)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитан `_active-map.md` + `tasks/_active/` — нет чужого claim на конфликтные keys
- [x] TZ / wave / dependencies прочитаны
- [x] Claim slot заполнен; Status = DONE
- [x] `tasks/_active/TZ-SALES-350.md` на месте до closeout

## Acceptance

- [x] Status RU dictionary matches Create КП 347: accepted = «Принято», converted = «В заказе»
- [x] Empty journal is RU and CTA navigates to `/proposals/create`
- [x] No raw EN status is rendered by the list status mapper; unknown codes use «Неизвестный статус»
- [x] FE tsc PASS; proposals page Jest 21/21 PASS; changed TS lint/Prettier PASS; diff-check PASS
- [x] `docs/pages/proposals.page.md` updated with the canonical status and empty-state contract

## Integrity slot

- [x] Type: page / frontend UX polish
- [x] FIC and SECTION-READINESS: N/A — existing `/proposals` route and capability unchanged
- [x] Page documentation updated; PAGE-TZ-INDEX unchanged because existing TZ entry already points to 350
- [x] Foreign WIP excluded; shell 317, backend, and shared status enums untouched
- [x] DOM self-check PASS via focused Angular fixture: custom empty state + CTA navigation

## Gates / evidence

- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/commercial/proposals/proposals.page.spec.ts --runInBand --no-coverage` → 21/21 PASS
- [x] Changed TypeScript Prettier → PASS
- [x] Changed TypeScript ESLint → PASS
- [x] `git diff --check` → PASS
- [x] `pnpm architecture:check` → PASS
- [ ] Root Markdown Prettier → unavailable in environment (no root prettier binary)

## Executor report

- Changed only proposals list TS/spec and proposals page documentation plus task evidence.
- Team Room join/inbox/status completed; claim API rejected unknown backlog TZ-350.
- No backend, Create КП shell, new feature, deploy, wipe, or unrelated WIP changes.

## Closeout

- [x] `tasks/_archive/2026-08/TZ-SALES-350.done.md` created with ARCHIVE_MARKER
- [x] `.mimocode/locks/TZ-SALES-350-proposals-list-shame.lock` created
- [x] Active marker removed after archive
- [x] Progress, root STATUS, and active-map checkpoint updated
- [x] Commit/push recorded in closeout
- closed_at: 2026-08-11T16:40:00Z
