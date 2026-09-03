# TZ-NX-KP-FAMILY-S44-ATTACH-ORGS: несколько фирм → варианты

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S41 (API), S43 (expand) DONE  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts`; `proposals-list.page.spec.ts`; optional `*-attach-orgs.dialog.ts` under `pages/proposals/`

**IMPLICIT CONFLICT:** frontend-nx/apps/kppdf-web — полная сборка приложения (`nx build kppdf-web`)

## BUILD INTEGRITY (обязательно)

1. **До CLAIM:** `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS; иначе STOP.  
2. **Перед archive:** тот же `nx build` — **последняя** команда.  
3. Не параллелить второй TZ на `kppdf-web/src/**`.

## Domain preflight

**Проверено:** `docs/architecture/nx-kp-family-roadmap.md`; BE  
`POST /quotations/:id/family/attach-organizations` + `AttachOrganizationsDto`  
(`items[{ organizationId, orgMarkupPercent? }]`).  
Organization = наша фирма (не Counterparty). Markup % — UI поле → BE; totals preview не пересчитывать на FE.  
Сбои: (1) пустой выбор → не POST; (2) 400/404 → тост; (3) повтор той же org — BE idempotent, UI refresh family.

## ИСХОДНОЕ

`proposals-list.page.ts` уже inject `PiOrganizationsService` и family expand (S43).  
Нет CTA/dialog attach в NX.

## ЧТО ДЕЛАТЬ

1. CTA «Несколько фирм» на solo/master (не на variant row).
2. Dialog (существующий Pi Dialog / AlertDialog паттерн NX): multi-select org из `organizationsApi.list` + optional `orgMarkupPercent`.
3. Confirm → `quotationsApi.attachOrganizations(id, { items })` → refresh expand `getFamily`.
4. Loading на confirm; disabled если 0 orgs.
5. Spec: open dialog → select → POST payload; cancel → no POST; error → toast path.

## ИЗМЕНЯТЬ

- `proposals-list.page.ts` (+html/styles если split)
- `proposals-list.page.spec.ts`
- optional new dialog component under `pages/proposals/`

## НЕ ИЗМЕНЯТЬ

- backend `attachOrganizations` semantics
- convert-to-order / S45 sync dialog
- legacy `frontend/` proposals

## КРИТЕРИИ ПРИЁМКИ

- [ ] Attach создаёт/обновляет variants; expand показывает новые org
- [ ] Empty selection не бьёт API
- [ ] Spec PASS
- [ ] `cd frontend-nx && pnpm exec nx build kppdf-web` PASS (последний)

## known_limitation

Нет live PDF preview markup в dialog — только % поле.

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S44-ATTACH-ORGS.done.md`
