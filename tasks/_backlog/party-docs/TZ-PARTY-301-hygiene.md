═══════════════════════════════════════════════════════════════
TZ-PARTY-301: Party hygiene (tenant · delete · INN index · stub)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-PARTY-DOCS #1
DEPENDS ON: нет (фундамент)
LAYER: 3–4
CHECKLIST: docs/agent-checklists/TZ-PARTY-301.md
PAGES: /counterparties ; /organizations
PAGE_DOCS: (обновить при закрытии)

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
