# DOC-341 docs sync templates create — DONE

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
TZ-DOC-341: Docs sync вЂ” templates create path (no builder create)
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Docs only
Р—РђР’РРЎРРњРћРЎРўР: DOC-337вЂ¦340 РїСЂРµРґРїРѕС‡С‚РёС‚РµР»СЊРЅРѕ DONE (РјРѕР¶РЅРѕ РїР°СЂР°Р»Р»РµР»СЊРЅРѕ docs-only)
LAYER: 1
PAGES: /doc-constructor/templates, /doc-constructor/builder
PAGE_DOCS: docs/pages/templates.page.md; docs/pages/builder.page.md

CONFLICT KEYS:
docs/pages/templates.page.md;
docs/pages/builder.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/STABILIZATION-WAVE-2026-08.md;
docs/agent-checklists/TZ-DOC-341.md

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

РЁРђР“ 1 вЂ” builder.page.md: СѓРґР°Р»РёС‚СЊ/РїРѕРјРµС‚РёС‚СЊ СѓСЃС‚Р°СЂРµРІС€РёР№ create-on-builder;
  create С‚РѕР»СЊРєРѕ СЃ /templates в†’ setup в†’ builder/:id.
РЁРђР“ 2 вЂ” templates.page.md: client-side category filter РїСЂР°РІРґР°; pageSize A3|A4|A5;
  duplicate category copy; СЃСЃС‹Р»РєР° РЅР° cookbook.
РЁРђР“ 3 вЂ” PAGE-TZ-INDEX: СЃС‚СЂРѕРєРё DOC-337вЂ¦341 / UX-DIALOG-301 / PROC-301.
РЁРђР“ 4 вЂ” STABILIZATION wave DoD checkboxes РЅРµ С‚СЂРѕРіР°С‚СЊ РєРѕРґРѕРј.

РќР•: product TS/HTML.

AC: docs СЃРѕРіР»Р°СЃРѕРІР°РЅС‹ СЃ РєРѕРґРѕРј create path; PAGE-TZ-INDEX updated; no code diff.

РџР РћРњРџРў: СЌС‚РѕС‚ TZ only. Checklist TZ-DOC-341.md

