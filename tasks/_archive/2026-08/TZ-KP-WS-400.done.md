# TZ-KP-WS-400 — DONE (часть B)

**Архив по части B** (rail IA). Часть A (`docs/audits/2026-08-23-kp-workspace-implementation-audit.md`)
ведётся claude (claim в `tasks/_active/TZ-KP-WS-400.md`) — полный DoD TZ собирается после merge
обеих частей. См. `docs/agent-checklists/TZ-KP-WS-400.md`.

## DoD — часть B

| Пункт | Артефакт | Proof | Gates |
|-------|----------|-------|-------|
| Final rail IA | `docs/pages/kp-workspace-rail-ia.md` | left 3 (Каталог/Шаблон/Клиент) + right 3 (Параметры/Таблица/Условия) + ribbon 8 действий; Lucide-иконка на секцию; tier S/L; сверка demo `chrome-tool-*` ↔ create `kp-create-toggle-*` → финал; icon dedup 6 конфликтов; button dedup 6 строк; migration note | docs-only: diff --check PASS |

## Что сделано (часть B)

1. **CLAIM** части B (agent_id freebuff-1) дописан в `tasks/_active/TZ-KP-WS-400.md`
   (claim части A — claude — не тронут).
2. Создан **`docs/pages/kp-workspace-rail-ia.md`**:
   - финальная IA: left rail (Каталог `Package` · Шаблон `FileText` · Клиент `ContactRound`),
     right rail (Параметры `SlidersHorizontal` · Редактор таблицы `TableProperties` **tier L** ·
     Условия `ScrollText`), ribbon (ориентация · селекторы · №/дата · статус/сумма ·
     Печать/PDF/Ещё/Fit);
   - **dedup**: «Товары»+demo `catalog` merge → «Каталог»; demo `composition` merge →
     Редактор таблицы; «Вывод» из rail → ribbon; конфликты иконок (`User`/`ContactRound`,
     `Settings`/`SlidersHorizontal`, `List`/`TableProperties`, двойной `Printer`) → резолюции;
   - **tier**: S = 480px overlay для списков, L = wide ~A4 только для таблицы
     (дельта: create сейчас tier `l` у products/recipient — в workspace это S);
   - **data-test**: create `kp-create-toggle-*` ↔ demo `chrome-tool-{id}` → целевые
     `chrome-tool-catalog/template/client/params/table/terms`; `kp-create-toggle-output`
     ликвидируется (в ribbon); остальные — алиасы до cleanup 409.
3. Checklist + этот архив с пометкой «часть B».
4. Не тронуты: `implementation-audit.md` (часть A), `frontend/**`, `backend/**`,
   frozen spec `docs/ux/kp-create-studio-spec.md`.

## SHA

| Коммит | Файлы |
|--------|-------|
| `21b88137` | `docs/pages/kp-workspace-rail-ia.md`, `docs/agent-checklists/TZ-KP-WS-400.md`, `tasks/_archive/2026-08/TZ-KP-WS-400.done.md` (claim B в `tasks/_active/` не коммитился — транзитный, часть A) |

## known_limitation

- PDF/image layout parsing — out of scope (общая для TZ-400).
- Внутренности панелей (кнопки/фильтры внутри секций) — по audit части A, не в rail IA.
