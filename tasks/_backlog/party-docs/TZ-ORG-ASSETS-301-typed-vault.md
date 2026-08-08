═══════════════════════════════════════════════════════════════
TZ-ORG-ASSETS-301: Typed vault logo / seal / signature
═══════════════════════════════════════════════════════════════

STATUS: BLOCKED_UNTIL_302 · WAVE-PARTY-DOCS #5
DEPENDS ON: TZ-PARTY-302 DONE → тогда READY
LAYER: 3–4
CHECKLIST: docs/agent-checklists/TZ-ORG-ASSETS-301.md
PAGES: /organizations
PAGE_DOCS: organizations.page.md

РОЛЬ: Backend photos + FE Org FullEditor slots

CONFLICT KEYS:
backend/src/modules/photos/**;
backend/src/modules/organization/**;
frontend/src/app/pages/organizations/**;
docs/agent-checklists/TZ-ORG-ASSETS-301.md;

---

## ИСХОДНОЕ

Peers: не новый pipeline — typed roles на существующем `POST /photos/upload`.  
Seal replace = admin only. legalAddress на Org вместе с vault.

## ЧТО ДЕЛАТЬ

1. Роли asset: `logo` | `seal` | `signature` (и meta на Photo/Org link).  
2. Upload bind к Org; one active per role (replace).  
3. Seal: только admin (или role с правом); 403 иначе.  
4. `legalAddress` поле Org + в FullEditor.  
5. FE: три слота в Org FullEditor (preview + replace).  
6. Тесты authz seal + upload.

## НЕ

- PDF print bind (→ ASSETS-302)  
- Client photos  
- DaData  
- deploy  

## AC

1. Logo/seal/signature загружаются и читаются.  
2. Seal replace non-admin → 403.  
3. legalAddress сохраняется.  
4. Gates + archive + push; deploy NO.
