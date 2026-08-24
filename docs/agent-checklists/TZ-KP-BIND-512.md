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
- [x] picker (data-field-picker-dialog.component.ts) — только registry, без хардкода старых RU labels (уже было так; не менялся); добавлен `data-field-picker-dialog.component.spec.ts` (2 теста)
- [x] TERM_VARIABLES: `{{client_name}}` label «Клиент» (token не менялся; уже было так); добавлен комментарий (= counterparty.name) + spec-тест на лейбл
- [x] Unit test registry: labels + siteAddress (2 новых теста в registry.service.spec.ts)
- [x] git diff: document-template.service.ts НЕ затронут этой TZ (grep подтвердил — файл дирти от чужого WIP, но diff от этой TZ = 0 строк)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS (0 errors)
- `cd backend && pnpm exec jest --testPathPattern="registry" --no-coverage` → 4/4 PASS
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend && pnpm exec jest --testPathPattern="data-field-picker|proposal-create-terms" --no-coverage` → 7/7 PASS (data-field-picker 2/2 new + proposal-create-terms 5/5)
- `git diff --check` → pre-existing trailing-whitespace notes in progress.md only (own append), no new issues
- `git diff --name-only | findstr document-template.service.ts` → matches (pre-existing dirty WIP, untouched by this claim — 0 lines from this diff)

## Executor report

- `backend/src/modules/registry/registry.service.ts`: DATA_SOURCES — organization.label → «Наша фирма»; counterparty.label → «Клиент»; counterparty.fields += siteAddress/siteName/contactName/contactPosition (print/enrichment catalogue, bag keys unchanged, Counterparty schema unchanged).
- `backend/src/modules/registry/registry.service.spec.ts`: +2 tests (`RegistryService.getDataSources` — labels + counterparty site/contact fields).
- Picker (`data-field-picker-dialog.component.ts`) audited: renders `data.sources`/`src.label`/`field.label` straight from the registry HTTP payload (`text-block-editor.component.ts:815-1039` fetches `/api/registry/data-sources` live) — no hardcoded RU labels found, no FE code change needed. Added `data-field-picker-dialog.component.spec.ts` (new, 2 tests) asserting mock-registry labels and `siteAddress`.
- `proposal-create-terms.component.ts` `TERM_VARIABLES`: `{{client_name}}` already labeled «Клиент» — added one-line comment (= counterparty.name alias) per TZ ШАГ 3 + spec test asserting the button label.
- `document-template.service.ts`: confirmed untouched (pre-existing WIP unrelated to this claim).

## Review handoff

- [x] READY FOR REVIEW → PO review
- [x] Archive after this report (backend-only registry change + docs; no FE risk)

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-24T00:40:00+03:00
