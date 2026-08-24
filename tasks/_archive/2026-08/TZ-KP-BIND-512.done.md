# TZ-KP-BIND-512: Registry labels + siteAddress в пикере

> Архив: `tasks/_archive/2026-08/TZ-KP-BIND-512.done.md`
> Исходная TZ: `tasks/TZ-KP-BIND-512-registry-labels-site-address.md`
> Checklist: `docs/agent-checklists/TZ-KP-BIND-512.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-24
closed_by: Claude (Codebuff/Buffy)
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (BE + FE)
  - tests: PASS (BE registry 4/4, FE data-field-picker 2/2 + proposal-create-terms 5/5)
  - lint: N/A (not required by TZ verification block)
  - checklist: ADDED (`docs/agent-checklists/TZ-KP-BIND-512.md`)
  - progress.md: UPDATED

## Что сделано

- `backend/src/modules/registry/registry.service.ts`: DATA_SOURCES —
  `organization.label` → «Наша фирма»; `counterparty.label` → «Клиент»;
  `counterparty.fields` += `siteAddress`/`siteName`/`contactName`/`contactPosition`
  (print/enrichment catalogue only — bag keys and Counterparty schema unchanged).
- `backend/src/modules/registry/registry.service.spec.ts`: +2 unit tests
  (`RegistryService.getDataSources` — labels + counterparty site/contact fields).
- Picker (`frontend/src/app/pages/doc-constructor/texts/data-field-picker-dialog.component.ts`)
  audited: already renders labels/fields straight from the registry HTTP payload
  (production consumer `text-block-editor.component.ts` fetches `/api/registry/data-sources`
  live) — no hardcoded RU labels found, no FE code change needed. Added
  `data-field-picker-dialog.component.spec.ts` (new file, 2 tests) asserting mock-registry
  labels («Наша фирма»/«Клиент») and `siteAddress` field render.
- `proposal-create-terms.component.ts` `TERM_VARIABLES`: `{{client_name}}` already
  labeled «Клиент» — added one-line comment (token = counterparty.name alias) per TZ
  ШАГ 3, plus a spec assertion that the «Клиент» variable button renders.

## HARD STOP respected

`backend/src/modules/document-template/document-template.service.ts` — confirmed
untouched (pre-existing dirty WIP from another task, not part of this diff).

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --testPathPattern="registry" --no-coverage` → 4/4 PASS
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest --testPathPattern="data-field-picker|proposal-create-terms" --no-coverage` → 7/7 PASS (2 test suites)
- `git diff --name-only | findstr document-template.service.ts` → matches pre-existing WIP only, zero lines from this diff

## known_limitation (carried from TZ)

- Invoice cascade supplier→bag.counterparty remains (successor).
- work-type vs workType key mismatch — not this TZ.
- Manual token `{{counterparty.siteAddress}}` already worked; now also in picker.
