# PROC-301 deploy smoke checklist — DONE

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
TZ-PROC-301: Deploy smoke checklist вЂ” Stabilization DoD
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

Р РћР›Р¬ РђР“Р•РќРўРђ: Docs / ops (optional tiny script note)
Р—РђР’РРЎРРњРћРЎРўР: DOC-337вЂ¦340 ideally DONE on main; deploy README
LAYER: 1
PAGES: /login, /doc-constructor/templates, /texts
PAGE_DOCS: docs/SESSION-2026-08-02-DEPLOY.md; deploy/synology/RUNBOOK.md

CONFLICT KEYS:
docs/SESSION-2026-08-02-DEPLOY.md;
deploy/synology/RUNBOOK.md;
deploy/synology/README.md;
docs/STABILIZATION-WAVE-2026-08.md;
docs/agent-checklists/TZ-PROC-301.md

в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
Р§РўРћ Р”Р•Р›РђРўР¬
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

РЁРђР“ 1 вЂ” Р’ SESSION / RUNBOOK Р·Р°С„РёРєСЃРёСЂРѕРІР°С‚СЊ smoke AC Stabilization Wave:

```text
VPN OFF
1. GET /api/health/ready в†’ ok
2. Login admin (CREDENTIALS.md)
3. Templates в†’ РЎРѕР·РґР°С‚СЊ в†’ A4 в†’ builder opens
4. Add one text block в†’ save (no category unavailable)
5. Texts: create block without categoryId в†’ default В«РћР±С‰РµРµВ»
6. Only one deploy at a time; docker ps = kppdf-backend + kppdf-mongo
```

РЁРђР“ 2 вЂ” РћС‚РјРµС‚РёС‚СЊ DoD checkboxes РІ STABILIZATION-WAVE РєРѕРіРґР° smoke PASS
  (РїРѕСЃР»Рµ СЂРµР°Р»СЊРЅРѕР№ РїСЂРѕРІРµСЂРєРё РёР»Рё executor browser).
РЁРђР“ 3 вЂ” РќРµ РјРµРЅСЏС‚СЊ deploy.py Р»РѕРіРёРєСѓ Р±РµР· Р±Р°РіР°.

РќР•: wipe; product feature code.

AC:
1. Checklist С‚РµРєСЃС‚ РІ SESSION + RUNBOOK
2. STABILIZATION DoD reflects smoke (checked when verified)
3. No secrets in docs

РџР РћРњРџРў: СЌС‚РѕС‚ TZ + deploy README lessons
Checklist: docs/agent-checklists/TZ-PROC-301.md

