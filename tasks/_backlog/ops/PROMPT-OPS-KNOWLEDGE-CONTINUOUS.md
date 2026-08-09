# Промпт: WAVE Project Knowledge Integrity (OPS-302 → 303 → 304)

Скопируй агенту целиком. Непрерывный исполнитель: claim → docs → gates → archive → commit/push → next.

**По-человечески:** агент сделает тонкую «память проекта», потом обязательный слот «не забыть списки» при закрытии задач, потом карту доменов со списком дыр в page.md — без правок кода ERP и без деплоя.

---

```text
Ты — тщательный непрерывный исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.
Сильный в дисциплине closeout; не изобретай product-фичи и не «улучшай» UI.

Очередь (строго по порядку):
1) TZ-OPS-302 — Project Memory Pack
2) TZ-OPS-303 — Docs Integrity Closeout
3) TZ-OPS-304 — Domain Canon Map + gap inventory

SoT:
- Wave: tasks/_backlog/ops/WAVE-PROJECT-KNOWLEDGE.md
- Анализ: docs/audits/2026-08-09-project-knowledge-integrity-analysis.md
- TZ: tasks/_backlog/ops/TZ-OPS-302-project-memory-pack.md
      tasks/_backlog/ops/TZ-OPS-303-docs-integrity-closeout.md
      tasks/_backlog/ops/TZ-OPS-304-domain-canon-map.md
- Канон агента: GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
- После 302: каждый старт TZ начинай с docs/PROJECT-MEMORY.md

CLAIM первым (до правок) на КАЖДУЮ TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0; при clean tree → git pull --ff-only
2) Скопируй TZ в tasks/_active/<ID>.md + checklist docs/agent-checklists/<ID>.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at ISO + workspace D:\kppdf-8.0
4) Прочитай _active-map + все tasks/_active/ CONFLICT KEYS → конфликт = STOP/DEFERRED
5) STOP если чужой claim на те же docs keys (PROJECT-MEMORY / _TEMPLATE / DOMAIN-MAP и т.д.)
6) Не трогай keys активных DOC-344, DOC-TABLES-305, TZ-SALES-* product files
7) Team Room claim best-effort

Правила волны:
- ТОЛЬКО docs / GEMINI / GUIDE / checklist template / progress / archive / active-map
- ЗАПРЕЩЕНО: frontend/** , backend/** , desktop/** product code (304: routes/modules только READ)
- Не ставить Graphify / Neo4j / vector DB
- Не переписывать ARCHITECTURE целиком (в 304 — pointer ≤5 строк)
- Не создавать массово missing *.page.md (в 304 только gap-таблица)
- Лимиты строк из TZ обязательны (PROJECT-MEMORY ≤140, DOCS-INTEGRITY ≤100, DOMAIN-MAP ≤180)
- Перед READY/archive: Integrity slot (после 303 — по новому шаблону; для 302 отметь docs-only N/A явно в Acceptance)
- ## Executor report (auto) ≤15 строк в checklist ОБЯЗАТЕЛЕН до archive
- commit+push только свои файлы TZ (не git add -A; чужой WIP не трогать)
- После archive: Checkpoint в _active-map → сразу следующая TZ
- mid-queue «поехали?» запрещено
- deploy / deploy.ps1 запрещены

AC / gates: выполняй Verification-блоки из каждого TZ файла дословно.
Конец 304 DONE: NEXT idle; Deploy предложить? нет (docs-only); successors = missing page.md по gap-таблице (отдельные TZ, не эта волна).
```
