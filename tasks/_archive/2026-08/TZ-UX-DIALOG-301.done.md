# UX-DIALOG-301 375px dialog clamp — DONE

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
TZ-UX-DIALOG-301: 375px dialog audit вЂ” proven overflow only
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Frontend shared dialog + form dialogs
Р—РђР’РРЎРРњРћРЎРўР: DOC-340 (shell clamp) DONE; docs/DIALOG-COOKBOOK.md
LAYER: 3
PAGES: materials, products, doc templates setup, tables
PAGE_DOCS: docs/DIALOG-COOKBOOK.md

CONFLICT KEYS:
frontend/src/app/shared/ui/dialog/pi-dialog.component.ts;
frontend/src/app/pages/materials/material-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
docs/agent-checklists/TZ-UX-DIALOG-301.md

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

РЁРђР“ 1 вЂ” Audit at 375px (DevTools): materials, product, table-template, setup.
  Р—Р°РїРёСЃР°С‚СЊ proven issues only (overflow, footer cut, horizontal scroll).
РЁРђР“ 2 вЂ” Fix **only proven**: maxWidth clamp on open() config and/or dialog CSS;
  follow cookbook. No redesign forms.
РЁРђР“ 3 вЂ” Checklist evidence (screenshot note or DOM assertion).
РЁРђР“ 4 вЂ” If no defects beyond DOC-340: archive DONE with В«no code; audit cleanВ».

РќР•: builder inspector; new dialog API; People page.

AC:
1. Audit table in checklist (pass/fail per dialog)
2. Any code fix has tsc + relevant specs PASS
3. No regression desktop md/lg

РџР РћРњРџРў: GEMINI.md + cookbook + DOC-340 archive
Checklist: docs/agent-checklists/TZ-UX-DIALOG-301.md

