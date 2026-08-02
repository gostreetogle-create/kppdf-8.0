═══════════════════════════════════════════════════════════════
TZ-JOURNEY-301: Канон потока цеха + карта дыр (spec-only)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Docs / product (можно Cursor Mode A)
ЗАВИСИМОСТИ: docs/product-vision-lite.md
LAYER: 1
PAGES: (карта всех operational)
PAGE_DOCS: PAGE-TZ-INDEX.md

CONFLICT KEYS:
docs/product-vision-lite.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-JOURNEY-301.md;
tasks/_backlog/vision/ (NEW folder ok)

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Таблица «шаг потока → страница сейчас → статус»:
  КП | Заказ | Договор | Модули | Виды работ | Люди | Склад |
  Документы | Гант/календарь | Проектное ОК.
  Для каждого: есть UI / нет / half / backlog.
ШАГ 2 — Зафиксировать дыры как successor IDs (не реализовывать):
  - нет UI КП → указатель на TZ-SALES-301
  - нет Ганта → backlog vision/GANT-calendar.md
  - People → UX-306 / WORKERS-302
ШАГ 3 — Одна схема mermaid в product-vision-lite или JOURNEY checklist.
ШАГ 4 — Executor report (для docs TZ: status DONE + commit docs).

НЕ: код продукта, новые модули Nest.

AC: таблица дыр в docs; backlog files созданы; INDEX обновлён.
ПРОМПТ: GEMINI.md + tasks/TZ-JOURNEY-301-shop-flow-gap-map.md.
Checklist TZ-JOURNEY-301. Push нет.

---
ARCHIVE_MARKER
outcome: DONE
date: 2026-08-02
agent: Cursor (lightweight UX/docs sweep)
summary: Shop flow gap map
---
