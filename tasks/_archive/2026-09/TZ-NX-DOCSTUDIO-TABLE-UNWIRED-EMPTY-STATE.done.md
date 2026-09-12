# TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE: честный empty (без source vs live пусто)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** PO: лишние пустые таблицы с «+ Таблица» не авто-wire  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio` canvas table  

### Preflight Check Output
- **Context read:** `studio-blocks-canvas.component.ts` L159–163 — один текст «Нет строк — добавьте в Свойствах» на **любой** `@empty` (в т.ч. wired catalog с `liveRows: []` после fail hydrate — врёт); `tableRows()` L386–394: пустой `liveRows=[]` → empty; без liveRows → sample rows (похоже на «данные»)
- **Key Constraints:** НЕ auto-wire всех manual (S15 expand banned)
- **Planned Deliverable:** разные RU empty по source
- **Validation Path:** canvas spec; nx build

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` (+ spec) ;  
опционально `studio-table-properties` hint для source; page.md one-liner

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. На холсте при `@empty` / нулевых видимых rows различать:
   - **нет live source** (`manual` / отсутствует dataSource): «Нет источника строк — в Свойствах выберите витрину или нажмите «Вставить таблицу» в Выбрано»
   - **есть catalog/quotation/order source**, но строк нет: «Нет строк из источника — проверьте Выбрано / КП / заказ» (не «добавьте в Свойствах» как для ручной сетки)
2. Не путать с ячейкой фото «Нет фото».
3. Spec на оба текста.
4. page.md: одна строка.

## НЕ
Авто-проставлять catalog source всем пустым таблицам; удалять «лишние» таблицы молча.

## AC
Оператор на пустой «+ Таблица» понимает, что это не сломанная витрина. Wired пустая — другой текст. Specs + build.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (nx test kppdf-web — 121 suites / 843 tests)
  - lint: not re-run separately this stage — no new lint-relevant patterns; pre-existing repo-wide debt unrelated
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE.md)
  - progress.md: N/A (combined entry at WAVE COMPLETE)
  - status synchronization: PASS
