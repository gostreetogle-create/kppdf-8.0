# TZ-KP-BIND-512 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-KP-BIND-512.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude (Codebuff/Buffy)
- claimed_at: 2026-08-24T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Codebuff standalone)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` — нет чужого CLAIM на CONFLICT KEYS этой TZ
- [x] TZ прочитана целиком (`tasks/TZ-KP-BIND-512-registry-labels-site-address.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-KP-BIND-512.md` на месте
- [x] HARD STOP подтверждён: `document-template.service.ts` НЕ трогается

## Acceptance

- [x] registry.service.ts: organization.label = «Наша фирма»
- [x] registry.service.ts: counterparty.label = «Клиент»
- [x] counterparty.fields += siteAddress/siteName/contactName/contactPosition
- [x] picker (data-field-picker-dialog.component.ts) — только registry, без хардкода старых RU labels (уже было так; не менялся)
- [x] TERM_VARIABLES: `{{client_name}}` label «Клиент» (token не менялся; уже было так)
- [x] Unit test registry: labels + siteAddress (2 новых теста в registry.service.spec.ts)
- [x] git diff: document-template.service.ts НЕ затронут этой TZ (grep подтвердил — файл дирти от чужого WIP, но diff от этой TZ = 0 строк)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS (0 errors)
- `cd backend && pnpm exec jest --testPathPattern="registry" --no-coverage` → 4/4 PASS
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend && pnpm exec jest --testPathPattern="data-field-picker|proposal-create-terms" --no-coverage` → proposal-create-terms 4/4 PASS (no data-field-picker spec file exists — not created, out of scope since no hardcode to fix)
- `git diff --check` → pre-existing trailing-whitespace notes in progress.md only (own append), no new issues
- `git diff --name-only | findstr document-template.service.ts` → matches (pre-existing dirty WIP, untouched by this claim — 0 lines from this diff)

## Executor report

- `backend/src/modules/registry/registry.service.ts`: DATA_SOURCES — organization.label → «Наша фирма»; counterparty.label → «Клиент»; counterparty.fields += siteAddress/siteName/contactName/contactPosition (print/enrichment catalogue, bag keys unchanged, Counterparty schema unchanged).
- `backend/src/modules/registry/registry.service.spec.ts`: +2 tests (`RegistryService.getDataSources` — labels + counterparty site/contact fields).
- Picker (`data-field-picker-dialog.component.ts`) audited: renders `data.sources`/`src.label`/`field.label` straight from the registry HTTP payload (`text-block-editor.component.ts:815-1039` fetches `/api/registry/data-sources` live) — no hardcoded RU labels found, no FE code change needed.
- `proposal-create-terms.component.ts` `TERM_VARIABLES`: `{{client_name}}` already labeled «Клиент» — no change needed.
- `document-template.service.ts`: confirmed untouched (pre-existing WIP unrelated to this claim).

## Review handoff

- [x] READY FOR REVIEW → PO review
- [x] Archive after this report (backend-only registry change + docs; no FE risk)

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-24T00:40:00+03:00
