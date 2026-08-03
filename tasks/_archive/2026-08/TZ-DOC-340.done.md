# DOC-340 mobile dialog viewport — DONE

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
TZ-DOC-340: Mobile dialog viewport вЂ” setup + shell clamp
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Shared UI PiDialog
Р—РђР’РРЎРРњРћРЎРўР: docs/DIALOG-COOKBOOK.md; DOC-336 DONE
LAYER: 3
PAGES: (shell) + /doc-constructor/templates setup
PAGE_DOCS: docs/DIALOG-COOKBOOK.md; templates.page.md note

CONFLICT KEYS:
frontend/src/app/shared/ui/dialog/pi-dialog.component.ts;
frontend/src/app/shared/ui/dialog/pi-dialog.component.spec.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
docs/DIALOG-COOKBOOK.md;
docs/agent-checklists/TZ-DOC-340.md

РџСЂРѕРІРµСЂРµРЅРѕ: width sm в†’ ~360px fixed; РЅРµС‚ min(100vw-2rem); overlay backdrop
  Р±РµР· backdrop-filter; sticky headers blur в†’ В«РїР»С‹РІС‘С‚В» РЅР° С‚РµР»РµС„РѕРЅРµ.

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

РЁРђР“ 1 вЂ” Shell: РґР»СЏ РІСЃРµС… width tiers `max-width: min(<tierPx>, calc(100vw - 2rem))`
  (+ safe-area РµСЃР»Рё РїСЂРѕСЃС‚Рѕ). Panel `bg-paper` opaque.
РЁРђР“ 2 вЂ” Setup dialog: РїСЂРѕРІРµСЂРёС‚СЊ РЅР° 375px (chips+footer РІРёРґРЅС‹).
РЁРђР“ 3 вЂ” Specs РЅР° panelClass / max-width contract; cookbook sync РµСЃР»Рё API РјРµРЅСЏР»СЃСЏ.
РЁРђР“ 4 вЂ” РќРµ С‚СЂРѕРіР°С‚СЊ overlay blur (РµРіРѕ РЅРµС‚); РЅРµ СЂРµС„Р°РєС‚РѕСЂРёС‚СЊ РІСЃРµ form dialogs
  (в†’ UX-DIALOG-301).

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
РќР• РР—РњР•РќРЇРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

- Dialog open API tokens
- templates create business logic
- Global app-layout sticky blur removal (out of scope unless proven one-liner)

AC:
1. РќР° viewport 375px setup dialog: РїР°РЅРµР»СЊ С†РµР»РёРєРѕРј, footer РІРёРґРµРЅ, Р±РµР· РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕРіРѕ clip
2. Desktop sm/md РІРёР·СѓР°Р»СЊРЅРѕ Р±РµР· СЂРµРіСЂРµСЃСЃРёРё
3. pi-dialog specs PASS; frontend tsc PASS
4. MANUAL_BROWSER_CHECK note РІ checklist РµСЃР»Рё РЅРµС‚ Playwright

РџР РћРњРџРў: GEMINI.md + СЌС‚РѕС‚ TZ + docs/DIALOG-COOKBOOK.md
Checklist: docs/agent-checklists/TZ-DOC-340.md

