═══════════════════════════════════════════════════════════════
TZ-PARTY-302: Organization FullEditor (kind C 1120)
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #2
DEPENDS ON: TZ-PARTY-301 DONE → тогда READY
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-PARTY-302.md
PAGES: /organizations
PAGE_DOCS: organizations.page.md

РОЛЬ: Frontend (+ DTO photoIds wire if needed, no vault roles yet)

CONFLICT KEYS:
frontend/src/app/pages/organizations/**;
backend/src/modules/organization/dto/**;
docs/pages/organizations.page.md;
docs/agent-checklists/TZ-PARTY-302.md;

---

## ИСХОДНОЕ

FE dialog ~7 полей; schema богаче (банк, ОГРН, signer, legalType, passport ИП).  
Canon dialog: content + maxWidth min(1120px, 100vw-2rem) как material/product.

## ЧТО ДЕЛАТЬ

1. Новый FullEditor (не растягивать старый md/lg): секции Основные / Реквизиты / Банк / Подписант (+ ИП паспорт если legalType).  
2. kind C width 1120.  
3. List page: создать/редактировать через FullEditor; показать isOurCompany/current.  
4. photoIds **не** типизировать (vault = ASSETS-301); опционально сырой dropzone later — лучше skip photos until 301.  
5. Docs organizations.page.md.

## НЕ

- Typed logo/seal roles  
- INN lookup  
- Counterparty UI  
- deploy  

## AC

1. Все ключевые schema-поля редактируются и сохраняются.  
2. Dialog width = kind C.  
3. FE tsc + organizations tests.  
4. Archive + push; deploy NO.

## ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor executor)
protected_files:
  - frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts
  - frontend/src/app/pages/organizations/organization-full-editor-dialog.component.spec.ts
  - frontend/src/app/pages/organizations/organizations.page.ts
  - frontend/src/app/shared/services/organizations.service.ts
  - docs/pages/organizations.page.md
verification:
  - acceptance criteria: PASS (1–4)
  - frontend typecheck: PASS
  - frontend development build: PASS (template typecheck)
  - frontend tests: PASS (13 — full editor 8, page 5)
  - frontend lint: PASS (0 errors)
  - checklist: UPDATED (docs/agent-checklists/TZ-PARTY-302.md)
  - progress.md: UPDATED
  - docs: organizations.page.md + PAGE-TZ-INDEX UPDATED
  - photos / typed vault: NOT TOUCHED (→ ASSETS-301)
  - deploy: NO
notes: Старый узкий organization-form-dialog.component.ts удалён — один write-path на
  организацию, а не «быстрый» и «полный» с разной логикой. Паспортные поля показываются и
  отправляются только для legalType=ip. Payload строится без пустых строк, потому что API
  работает с forbidNonWhitelisted. `type="date"` пришлось делать нативным input: PiInputType
  не содержит 'date'.
