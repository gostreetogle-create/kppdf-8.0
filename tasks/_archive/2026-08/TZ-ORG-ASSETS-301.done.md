═══════════════════════════════════════════════════════════════
TZ-ORG-ASSETS-301: Typed vault logo / seal / signature
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #5
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

## ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor executor)
protected_files:
  - backend/src/modules/organization/organization.schema.ts
  - backend/src/modules/organization/organization.service.ts
  - backend/src/modules/organization/organization.controller.ts
  - backend/src/modules/organization/organization.module.ts
  - backend/src/modules/organization/dto/create-organization.dto.ts
  - backend/src/modules/photos/image-upload.options.ts
  - backend/src/modules/photos/photos.module.ts
  - backend/test/e2e/organization-assets.e2e-spec.ts
  - frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts
  - frontend/src/app/shared/services/organizations.service.ts
  - docs/pages/organizations.page.md
verification:
  - acceptance criteria: PASS (1–4)
  - backend typecheck: PASS (весь `tsc --noEmit` чист)
  - backend unit organization: PASS 19/19
  - backend e2e organization-assets: PASS 6/6 (replace, seal 403/200, DELETE 404, IDOR 404)
  - frontend typecheck + production build: PASS
  - frontend tests pages/organizations: PASS 20/20
  - lint (BE organization/photos, FE organizations): 0 errors
  - checklist: UPDATED (docs/agent-checklists/TZ-ORG-ASSETS-301.md)
  - progress.md + ARCHITECTURE.md + organizations.page.md: UPDATED
  - PDF print bind: NOT TOUCHED (→ ASSETS-302)
  - client photos / DaData: NOT TOUCHED
  - deploy: NO
extended_conflict_keys:
  - backend/src/modules/photos/image-upload.options.ts (новый общий multer-конфиг)
  - frontend/src/app/shared/services/organizations.service.ts (assets API + типы)
  - backend/src/modules/catalog/catalog-314.archive.spec.ts (2 строки мока: TZ-COST-302
    добавил 6-й аргумент ProductModuleService и оставил `tsc` красным)
  (в `_active/` параллельных TZ нет — конфликта не было)
notes: Слот один на роль — замена, а не история версий: «какая печать актуальная» не должно быть
  вопросом. Прежнее Photo удаляется, иначе диск обрастает мусором на каждой замене. Печать
  admin-only и на upload, и на remove; менеджер видит превью, но кнопок нет — отказ в сервисе,
  UI лишь не обманывает. Multer-конфиг вынесен в общий файл, чтобы лимит/mime не разъехались с
  `POST /photos/upload`. Массив пишется `findOneAndUpdate`, а не `doc.save()`:
  `optimisticLockPlugin` вручную поднимает `__v` и роняет save() на массивах VersionError-ом
  (плагин чужой — отдельная TZ). Pipeline-update (`$concatArrays`) Mongoose кастует по схеме и
  тихо записывает пустой массив — поймано e2e, не типами.
