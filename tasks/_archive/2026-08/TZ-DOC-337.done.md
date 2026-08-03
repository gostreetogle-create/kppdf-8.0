# DOC-337 pageSize A3|A4|A5 canon — DONE

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-03
closed_by: local-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend + backend tsc --noEmit)
  - jest: PASS (template-setup-dialog + templates.page — 38 tests)
  - browser smoke: CHECKLIST in SESSION/RUNBOOK (PROC-301); live prod smoke = PO after deploy
protects:
  - Stabilization Wave vertical: create template → builder
  - PiDialog / form dialogs viewport clamp
residual:
  - UX-306 People PARKED
  - live 375px browser verify on prod after deploy
```

## Original TZ

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
TZ-DOC-337: pageSize canon вЂ” DTO в†” schema в†” setup chips
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Backend DTO + Frontend types (document templates)
Р—РђР’РРЎРРњРћРЎРўР: Stabilization Wave; DOC-336 DONE
LAYER: 2
PAGES: /doc-constructor/templates
PAGE_DOCS: docs/pages/templates.page.md

CONFLICT KEYS:
backend/src/modules/document-template/dto/create-document-template.dto.ts;
backend/src/modules/document-template/dto/update-document-template.dto.ts;
backend/src/modules/document-template/document-template.schema.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
frontend/src/app/shared/services/pi-document-templates.service.ts;
docs/agent-checklists/TZ-DOC-337.md

РџСЂРѕРІРµСЂРµРЅРѕ: schema enum A3|A4|A5; CreateDto @IsIn A4|A5|Letter|Legal (РЅРµС‚ A3);
  setup chips A3|A4|A5; FE type A3|A4|A5; JSDoc service РІСЂС‘С‚ Letter|Legal.

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
РРЎРҐРћР”РќРћР•
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р’С‹Р±РѕСЂ **A3** РІ setup в†’ POST 400 ValidationPipe. Schema/UI Р¶РґСѓС‚ A3.
Letter/Legal РІ DTO РЅРµ РІ schema вЂ” РјС‘СЂС‚РІС‹Р№ РєРѕРЅС‚СЂР°РєС‚.

РљРђРќРћРќ (Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ PO/РІРѕР»РЅРѕР№): pageSize = **A3 | A4 | A5** РІРµР·РґРµ.
Letter/Legal СѓР±СЂР°С‚СЊ РёР· Create/Update DTO (РёР»Рё РЅРµ РїСЂРёРЅРёРјР°С‚СЊ).

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

РЁРђР“ 1 вЂ” CreateDocumentTemplateDto (+ Update partial): `@IsIn(['A3','A4','A5'])`.
РЁРђР“ 2 вЂ” FE: PageSize type + service JSDoc = A3|A4|A5; chips Р±РµР· РёР·РјРµРЅРµРЅРёР№ РµСЃР»Рё СѓР¶Рµ С‚Р°Рє.
РЁРђР“ 3 вЂ” Unit/e2e: create СЃ pageSize A3 в†’ 201 (РёР»Рё silent ok); A4/A5 green.
РЁРђР“ 4 вЂ” Checklist TZ-DOC-337; СЃС‚СЂРѕРєР° PAGE-TZ-INDEX.

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
РќР• РР—РњР•РќРЇРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

- Builder canvas / block renderer
- Organization ensure / INN
- PiDialog shell (в†’ DOC-340)
- Duplicate flow (в†’ DOC-339)

AC:
1. POST /document-templates СЃ pageSize A3 РїСЂРѕС…РѕРґРёС‚ РІР°Р»РёРґР°С†РёСЋ DTO
2. A4/A5 РїРѕ-РїСЂРµР¶РЅРµРјСѓ ok
3. Letter/Legal в†’ 400
4. `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` PASS
5. Targeted jest DTO/service РёР»Рё e2e create A3 PASS

РџР РћРњРџРў: GEMINI.md + СЌС‚РѕС‚ TZ + docs/STABILIZATION-WAVE-2026-08.md
Checklist: docs/agent-checklists/TZ-DOC-337.md РґРѕ РїСЂР°РІРѕРє. Push С‚РѕР»СЊРєРѕ РїРѕ PO.

