# DOC-338 create category system-only — DONE

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
TZ-DOC-338: Template create вЂ” category scope + ensureOrg reload
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Frontend templates create path
Р—РђР’РРЎРРњРћРЎРўР: DOC-337 (pageSize) РїСЂРµРґРїРѕС‡С‚РёС‚РµР»СЊРЅРѕ DONE; seed doc-template categories
LAYER: 3
PAGES: /doc-constructor/templates
PAGE_DOCS: docs/pages/templates.page.md

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/templates/templates.page.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
frontend/src/app/shared/services/pi-document-template-categories.service.ts;
docs/agent-checklists/TZ-DOC-338.md

РџСЂРѕРІРµСЂРµРЅРѕ: setup list({ activeOnly: true }) Р±РµР· organizationId;
  createWithSettings Р±РµСЂС‘С‚ organizations[0] / auto-org; assertAssignable
  СЂРµР¶РµС‚ С‡СѓР¶РѕР№ org category в†’ toast РїРѕСЃР»Рµ confirm.

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

РЁРђР“ 1 вЂ” РљР°РЅРѕРЅ: РєР°С‚РµРіРѕСЂРёРё РІ setup = system + (optional) org С‚РµРєСѓС‰РµРіРѕ ensure target.
  Р’Р°СЂРёР°РЅС‚ A (РїСЂРµРґРїРѕС‡С‚РёС‚РµР»СЊРЅРѕ): РїРµСЂРµРґ open dialog СѓР·РЅР°С‚СЊ/ensure orgId, РїРµСЂРµРґР°РІР°С‚СЊ
  РІ setup data; list categories СЃ organizationId (РёР»Рё filter assignable client-side).
  Р’Р°СЂРёР°РЅС‚ B: РїРѕСЃР»Рµ ensureOrg РІ createWithSettings вЂ” РµСЃР»Рё category РЅРµ assignable,
  toast + РЅРµ POST (РёР»Рё re-open). РњРёРЅРёРјСѓРј: РЅРµ СЃР»Р°С‚СЊ foreign categoryId.
РЁРђР“ 2 вЂ” РџСѓСЃС‚РѕР№ РєР°С‚Р°Р»РѕРі: copy + CTA routerLink `/doc-template-categories`
  (РёР»Рё Р°РєС‚СѓР°Р»СЊРЅС‹Р№ path СЃРїСЂР°РІРѕС‡РЅРёРєР° РєР°С‚РµРіРѕСЂРёР№ С€Р°Р±Р»РѕРЅРѕРІ).
РЁРђР“ 3 вЂ” РўРµСЃС‚С‹: mock list categories scoped; assertAssignable fail path.
РЁРђР“ 4 вЂ” РќРµ РјРµРЅСЏС‚СЊ hardcoded INN auto-org РІ СЌС‚РѕРј TZ (known_limitation / successor).

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
РќР• РР—РњР•РќРЇРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

- pageSize DTO (DOC-337)
- Duplicate category PATCH (DOC-339)
- PiDialog CSS viewport (DOC-340)
- Backend assertAssignable rules (С‚РѕР»СЊРєРѕ FE wiring)

AC:
1. Confirm СЃ system В«РћР±С‰РµРµВ» + first org в†’ create 2xx в†’ navigate builder
2. РќРµС‚ POST СЃ categoryId С‡СѓР¶РѕРіРѕ org (РґРѕРєР°Р·Р°С‚РµР»СЊСЃС‚РІРѕ С‚РµСЃС‚РѕРј РёР»Рё guard)
3. Empty categories в†’ Create disabled + CTA, РЅРµ silent fail
4. frontend tsc + templates.page / setup-dialog specs PASS

РџР РћРњРџРў: GEMINI.md + СЌС‚РѕС‚ TZ + docs/DIALOG-COOKBOOK.md
Checklist: docs/agent-checklists/TZ-DOC-338.md
known_limitation: multi-org picker UX = successor

