# TZ-JOURNEY-301 checklist

**TZ:** `tasks/TZ-JOURNEY-301-shop-flow-gap-map.md` (spec-only, LAYER 1 docs/product)
**Зависимости:** `docs/product-vision-lite.md` (канон), `docs/pages/PAGE-TZ-INDEX.md`
**Conflicts:** `docs/product-vision-lite.md`, `docs/pages/PAGE-TZ-INDEX.md`, этот checklist, `tasks/_backlog/vision/`

## Acceptance

- [x] Gap table written (`docs/product-vision-lite.md` → «Карта потока → страницы (gap map, TZ-JOURNEY-301)»)
  - 10 шагов: КП ⛔ → Заказ ✅ → Договор ✅ → Модули ✅ → Виды работ ✅ → Люди 🔶 → Склад ✅ → Документы ✅ → Гант 🅿️ → Проектное ОК 🅿️
- [x] GANT backlog linked (`tasks/_backlog/vision/GANT-calendar.md` — PARKED, создан; INDEX ссылается на него)
- [x] Successor IDs зафиксированы (не реализованы): КП → `TZ-SALES-301`; People → `UX-306` + `WORKERS-302`; Гант/Проектное ОК → `_backlog/vision/GANT-calendar.md`
- [x] mermaid-схема добавлена в `product-vision-lite.md` (flowchart LR, один граф всего потока)
- [x] PAGE-TZ-INDEX обновлён (секция Vision / access / sales уже содержит JOURNEY-301 + GANT row)
- [x] `## Executor report (auto)` заполнен (ниже)

## Executor report (auto)

- **status:** DONE (spec-only, docs + backlog, no code)
- **commit:** `22caa41d9e9486156e28428c21f8d8ded0d4c067`
- **gates:** markdown/diff review — чисто; кодовых тестов не требуется (docs task, GEMINI.md: «для документных задач кодовые тесты не нужны»); `git diff --check` clean
- **known:** дыра «КП без UI» остаётся открытой до TZ-SALES-301; Гант намеренно parked; этот TZ только фиксирует карту
- **ask:** нет
