# Промпт: WAVE Page docs gaps (OPS-305 → 306 → 307)

Скопируй агенту целиком. Фоновая docs-работа; **не** трогает Create КП / витрину / builder FE.

**По-человечески:** агент допишет текстовые шпаргалки по 6 экранам, у которых не было описания в `docs/pages` (для ИИ, не для кнопки в программе), и подчистит оглавление README. Код ERP не меняет.

---

```text
Ты — тщательный непрерывный исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.
Сильный в docs closeout. Не изобретай UI и не «улучшай» продукт.

Очередь (строго):
1) TZ-OPS-305 — page.md doc-template-categories + text-block-categories
2) TZ-OPS-306 — page.md admin users + roles
3) TZ-OPS-307 — page.md design/shipping stubs + pages/README hygiene

SoT:
- Wave: tasks/_backlog/ops/WAVE-PAGE-DOCS-GAPS.md
- TZ: tasks/_backlog/ops/TZ-OPS-305-page-docs-doc-categories.md
      tasks/_backlog/ops/TZ-OPS-306-page-docs-admin.md
      tasks/_backlog/ops/TZ-OPS-307-page-docs-stubs-readme.md
- Шаблон: docs/pages/_template.md ; эталон: docs/pages/form-profiles.page.md
- Gaps: docs/DOMAIN-MAP.md §1.3
- Канон: GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4 + docs/PROJECT-MEMORY.md

CLAIM первым (до правок) на КАЖДУЮ TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0; clean → git pull --ff-only
2) tasks/_active/<ID>.md + checklist docs/agent-checklists/<ID>.md (_TEMPLATE + Integrity slot)
3) Status CLAIMED; Claim slot: agent_id + claimed_at ISO + workspace
4) _active-map + tasks/_active/ CONFLICT KEYS → конфликт = STOP
5) STOP если чужой claim на те же docs/pages/* keys этой TZ
6) Не трогай FE keys активных SALES-328 / DOC-TABLES-305 / DOC-343 / proposal-* / builder
7) Team Room claim best-effort

Правила:
- ТОЛЬКО docs (+ checklist/progress/archive/active-map/PAGE-TZ-INDEX/DOMAIN-MAP/README)
- BAN: frontend/** backend/** desktop/** product writes; deploy; Graphify
- Page `.ts` / services / routes — READ only, чтобы описать факт
- Не смешивай чужой WIP (document-template.service.ts orientation, PO-DIARY dirty, DOC-343) в свои коммиты
- После каждой TZ: gates → ## Executor report (auto) ≤15 строк → archive + lock → commit+push → Checkpoint _active-map → next
- mid-queue «поехали?» запрещено

После 307 DONE: NEXT idle. Deploy: NO.
Отчёт PO: 3 SHA + список созданных page.md + DOMAIN-MAP gaps = 0 NO.
```
