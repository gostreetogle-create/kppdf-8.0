# PROMPT — Claude: verify DocStudio waves (catalog-table-IA + list/templates)

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + how-to-connect-ai.
UNATTENDED. Не пиши product-код, кроме hotfix если gate RED и фикс ≤15 строк on-path
к двум волнам ниже. Иначе FAIL + deferred TZ. Не deploy. Не wipe.

Цель: честно перепрогнать проверки всего, что сделали в:
- WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA (3fd93047→bd7ed96f→b0258eee→d235f4f1→b3908178)
- WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN (c9f687e4→eaa2a1ac→7479caa7)

Baseline: git fetch && checkout main && pull --ff-only. Tip must contain 7479caa7.

═══ 1. Evidence read (5 мин) ═══
Открой WAVE + чеклисты:
- docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md
- docs/agent-checklists/DOCSTUDIO-CATALOG-TABLE-IA-CHECKLIST.md
- docs/agent-checklists/WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN.md
- docs/agent-checklists/DOCSTUDIO-LIST-TEMPLATES-CLEAN-CHECKLIST.md
Выпиши DoD чекбоксы — все должны быть [x].

═══ 2. Spot-check code (не рефактор) ═══
Докажи в отчёте 1-liner evidence:
- refreshLiveDataSetsOnLoad → hydrateTablesSerially (не parallel void)
- insertCatalogTable: toast «уже на листе» + refreshCatalogTablesOfKind
- studioTableEmptyStateLabel: два разных RU текста
- vitrina «Изменить» + onCatalogEntitySaved → refreshCatalogTablesOfKind
- studio-list: НЕТ «Новое КП» / createKp
- document-template findAll: deletedAt null + tags $ne sentinel

═══ 3. Focused specs (обязательно) ═══
frontend-nx:
  npx nx test kppdf-web --testPathPattern="studio-editor-hydrate-serial|studio-editor-catalog-insert|studio-data-vitrina-edit|studio-blocks-canvas|studio-table-defaults|studio-list" --skip-nx-cache
backend:
  pnpm test -- document-template.sentinel document-template.category
(или точные пути spec файлов sentinel/findAll — найди и запусти).

═══ 4. Full gates (обязательно, fresh) ═══
cd frontend-nx
  pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit   # или project-local tsc как в GEMINI
  npx nx test kppdf-web --skip-nx-cache
  npx nx lint kppdf-web
  npx nx build kppdf-web
cd backend
  pnpm exec tsc -p tsconfig.build.json --noEmit
  pnpm test
  pnpm lint
cd ..
  pnpm architecture:check

═══ 5. Артефакт ═══
Запиши docs/audits/2026-09-13-docstudio-waves-verify.md:
- tip SHA
- focused specs PASS/FAIL + counts
- full gates PASS/FAIL + suite/test counts
- spot-check bullets
- verdict: VERIFY PASS | VERIFY FAIL (+ что сломано)

Обнови docs/agent-checklists/_NOW.md → Claude IDLE + ссылка на audit.
Commit+push только docs audit + _NOW (если PASS). Если FAIL — не «закрывай», report + optional deferred TZ в _ready.

НЕ: deploy; wipe; новая фича; трогать catalog IA «улучшить»; soup.
Финал в чат: tip SHA + VERIFY PASS/FAIL + 4–6 строк evidence.
```
