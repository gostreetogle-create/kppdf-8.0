ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (AI Agent)
tz_id: TZ-JOURNEY-301-shop-flow-gap-map
commit: 22caa41d9e9486156e28428c21f8d8ded0d4c067
verification:
  - acceptance criteria: PASS
  - gap table in docs: PASS (docs/product-vision-lite.md → «Карта потока → страницы (gap map, TZ-JOURNEY-301)»)
  - GANT backlog file: PASS (tasks/_backlog/vision/GANT-calendar.md — PARKED, связан из карты)
  - INDEX updated: PASS (docs/pages/PAGE-TZ-INDEX.md — секция Vision/access/sales + GANT row)
  - mermaid scheme: PASS (один flowchart LR в product-vision-lite.md)
  - checklist: ADDED (docs/agent-checklists/TZ-JOURNEY-301.md, AC + Executor report)
  - typecheck/tests: N/A (spec-only docs TZ, GEMINI.md: «для документных задач кодовые тесты не нужны»)
  - git diff --check: PASS
  - progress.md: UPDATED
  - status synchronization: PASS

═══════════════════════════════════════════════════════════════
TZ-JOURNEY-301: Канон потока цеха + карта дыр (spec-only)
═══════════════════════════════════════════════════════════════

РОЛЬ: Docs / product. LAYER 1. Кода продукта НЕТ (по спеке).

ЧТО СДЕЛАНО (по шагам TZ):
1. ШАГ 1 — Таблица «шаг потока → страница сейчас → статус» добавлена в
   `docs/product-vision-lite.md` (раздел «Карта потока → страницы (gap map,
   TZ-JOURNEY-301)»):
   - КП ⛔ (нет UI) → TZ-SALES-301
   - Заказ ✅ /orders
   - Договор ✅ /contracts
   - Модули ✅ /modules
   - Виды работ ✅ /work-types
   - Люди 🔶 /people (каркас) → UX-306 + WORKERS-302
   - Склад ✅ /inventory, /storage-items, /stock-movements
   - Документы ✅ /doc-constructor/documents
   - Гант/календарь 🅿️ → backlog vision/GANT-calendar.md
   - Проектное ОК 🅿️ → тот же GANT backlog
2. ШАГ 2 — Дыры зафиксированы как successor IDs, НЕ реализованы:
   - КП без UI → `tasks/TZ-SALES-301-proposal-thin-ui.md` (существует)
   - Гант → `tasks/_backlog/vision/GANT-calendar.md` (существует, PARKED)
   - People → `tasks/TZ-UX-306-people-route-align.md` + `tasks/TZ-WORKERS-302-people-page-and-person-card.md`
3. ШАГ 3 — Одна mermaid-схема (flowchart LR) в product-vision-lite.md
   (КП → Заказ → Договор/Модули → Виды работ → Люди? → Склад → Документы → Проектное ОК; parked-ветки на Гант).
4. ШАГ 4 — Executor report в `docs/agent-checklists/TZ-JOURNEY-301.md` (status DONE).

ФАЙЛЫ (этот TZ):
- M docs/product-vision-lite.md — gap map + mermaid + successor IDs
- M docs/agent-checklists/TZ-JOURNEY-301.md — AC + Executor report
- M docs/pages/PAGE-TZ-INDEX.md — (опционально) pointer на gap map
- A tasks/_backlog/vision/GANT-calendar.md — создан параллельной UX-волной, verified on main
- A tasks/_archive/2026-08/TZ-JOURNEY-301-shop-flow-gap-map.done.md (этот файл)
- M STATUS.md, progress.md, .mimocode/locks/TZ-JOURNEY-301-shop-flow-gap-map.lock

ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ:
- Карта — «на момент 2026-08-02». КП-дыра останется открытой до TZ-SALES-301;
  Гант намеренно parked (после ACCESS+SALES+WORKERS-302 по GANT-calendar.md).
- `docs/pages/PAGE-TZ-INDEX.md` уже содержал row JOURNEY-301/GANT от параллельной
  UX-волны; правка минимальна (добавлен pointer на gap map в product-vision-lite).
- Кодовая проверка N/A — spec-only; проверен markdown/diff и `git diff --check`.

related_archive:
  - docs/agent-checklists/TZ-JOURNEY-301.md (checklist + executor report)
  - tasks/_backlog/vision/GANT-calendar.md (parked successor)
  - tasks/TZ-SALES-301-proposal-thin-ui.md (successor, активный)
