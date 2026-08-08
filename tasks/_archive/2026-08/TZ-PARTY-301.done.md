═══════════════════════════════════════════════════════════════
TZ-PARTY-301: Party hygiene (tenant · delete · INN index · stub)
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #1
DEPENDS ON: нет (фундамент)
LAYER: 3–4
CHECKLIST: docs/agent-checklists/TZ-PARTY-301.md
PAGES: /counterparties ; /organizations
PAGE_DOCS: ARCHITECTURE.md §Organizations & Contacts → Party hygiene (TZ-PARTY-301)

РОЛЬ: Backend + thin FE badge

CONFLICT KEYS:
backend/src/modules/counterparty/**;
backend/src/modules/organization/**;
backend/src/database/migrations/**;
frontend/src/app/pages/counterparties/**;
docs/agent-checklists/TZ-PARTY-301.md;

Проверено: peers Opus/Sonnet/Sol — IDOR, quickCreate без organizationId,
  deletedAt no-op, global unique inn vs compound.

---

## ИСХОДНОЕ

1. Counterparty quick-create не штампует `organizationId` из JWT.  
2. CP findById/update/remove и Organization list/get/update/remove без tenant-guard.  
3. Soft-delete пишет `deletedAt`, поля нет в schema → strict no-op.  
4. `Counterparty.inn` global unique + compound unique — конфликт.  
5. Stub ИНН неотличим от настоящего.

## ЧТО ДЕЛАТЬ

1. **Tenant-stamp:** create + quickCreate берут `organizationId` только из JWT; запретить mass-assign organizationId из body.  
2. **Org-scope:** get/update/remove CP и Org — только свой tenant (политика: одна «наша» Org на user.organizationId; чужие Org — 404).  
3. **deletedAt** в schema Org+CP (+ фильтр list не показывает удалённые); тест что DELETE реально soft-delete.  
4. **INN index:** убрать global unique на inn; оставить compound `{organizationId, inn}` unique sparse; миграция + дедуп/отчёт коллизий.  
5. **Stub flag:** `innIsStub` (или enum verification) на CP; quick-create ставит true; FE badge «ИНН временный» в списке/карточке.  
6. **isOurCompany / current:** поле или settings-указатель «наша фирма» + `GET` current для документов (минимум: одна Org = current).

## НЕ

- FullEditor UI (302/303)  
- DaData  
- Vault photos  
- supply rewrite  
- deploy  

## AC

1. IDOR-тесты: чужой CP/Org → 404.  
2. quickCreate всегда с organizationId пользователя.  
3. DELETE soft-works; list без deleted.  
4. Два tenant могут иметь один inn (после миграции) **или** политика single-org явно в тесте.  
5. Badge stub виден.  
6. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` + targeted jest counterparty/organization.  
7. Archive + commit/push; deploy NO.

## ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor executor)
protected_files:
  - backend/src/modules/counterparty/counterparty.service.ts
  - backend/src/modules/counterparty/counterparty.controller.ts
  - backend/src/modules/counterparty/counterparty.schema.ts
  - backend/src/modules/counterparty/counterparty.spec.ts
  - backend/src/modules/organization/organization.service.ts
  - backend/src/modules/organization/organization.controller.ts
  - backend/src/modules/organization/organization.schema.ts
  - backend/src/modules/organization/organization.spec.ts
  - backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts
  - frontend/src/app/pages/counterparties/counterparties.page.ts
verification:
  - acceptance criteria: PASS (1–6)
  - backend typecheck: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`)
  - backend tests: PASS (31 — counterparty, organization, migration)
  - backend lint: 0 errors (45 pre-existing `any` warnings в spec-моках)
  - frontend typecheck + development build: PASS
  - frontend tests: PASS (counterparties.page 3/3)
  - checklist: UPDATED (docs/agent-checklists/TZ-PARTY-301.md)
  - progress.md: UPDATED
  - ARCHITECTURE.md: UPDATED (§Organizations & Contacts → Party hygiene)
  - desktop/mcp-runtime: NOT TOUCHED
  - deploy: NO
notes: Tenant fields больше не читаются из body (withoutTenantFields). Чужой tenant = 404,
  не 403. Global unique `inn_1` снимается миграцией; per-tenant уникальность через compound
  sparse index. `Organization.inn` остаётся глобально unique — Org и есть tenant. Миграция
  ручная (ts-node), не bootstrap-hook.
