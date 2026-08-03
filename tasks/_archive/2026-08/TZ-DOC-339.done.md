# DOC-339 duplicate honesty — DONE

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
TZ-DOC-339: Duplicate honesty вЂ” category field
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Frontend templates duplicate
Р—РђР’РРЎРРњРћРЎРўР: DOC-337 optional; РЅРµ Р±Р»РѕРєРёСЂСѓРµС‚ 338
LAYER: 3
PAGES: /doc-constructor/templates
PAGE_DOCS: docs/pages/templates.page.md

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/templates/templates.page.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
docs/agent-checklists/TZ-DOC-339.md

РџСЂРѕРІРµСЂРµРЅРѕ: duplicate opens setup (category+size+orientation); POST duplicate
  СЃРѕС…СЂР°РЅСЏРµС‚ source category; PATCH С‚РѕР»СЊРєРѕ pageSize+orientation в†’ category РёР· UI РёРіРЅРѕСЂ.

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬ (РєР°РЅРѕРЅ)
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

**РљР°РЅРѕРЅ РІРѕР»РЅС‹:** РІ mode `duplicate` **РЅРµ СЃРѕР±РёСЂР°С‚СЊ** category (СЃРєСЂС‹С‚СЊ РїРѕР»Рµ;
  copy: В«РљР°С‚РµРіРѕСЂРёСЏ РєРѕРїРёСЂСѓРµС‚СЃСЏ СЃ РёСЃС…РѕРґРЅРѕРіРѕ С€Р°Р±Р»РѕРЅР°В»). pageSize/orientation вЂ”
  РєР°Рє СЃРµР№С‡Р°СЃ С‡РµСЂРµР· PATCH.

РђР»СЊС‚РµСЂРЅР°С‚РёРІР° (РќР• Р±СЂР°С‚СЊ Р±РµР· PO): PATCH categoryId вЂ” Р±РѕР»СЊС€Рµ scope.

РЁРђР“ 1 вЂ” TemplateSetupData.mode==='duplicate' в†’ hide category; canConfirm Р±РµР· categoryId.
РЁРђР“ 2 вЂ” templates.page duplicate path: РЅРµ Р¶РґР°С‚СЊ categoryId РёР· result.
РЁРђР“ 3 вЂ” Specs + docs templates.page.md one line.

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
РќР• РР—РњР•РќРЇРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

- Create mode category required
- Backend duplicate endpoint semantics (source category)
- ensureOrg / INN

AC:
1. Duplicate UI РЅРµ С‚СЂРµР±СѓРµС‚ РІС‹Р±РѕСЂР° РєР°С‚РµРіРѕСЂРёРё
2. РџРѕСЃР»Рµ duplicate category === source (assert РІ unit РёР»Рё e2e mock)
3. pageSize/orientation РёР· РґРёР°Р»РѕРіР° РїСЂРёРјРµРЅСЏСЋС‚СЃСЏ
4. tsc + specs PASS

РџР РћРњРџРў: GEMINI.md + СЌС‚РѕС‚ TZ
Checklist: docs/agent-checklists/TZ-DOC-339.md

