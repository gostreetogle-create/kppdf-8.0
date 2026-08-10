═══════════════════════════════════════════════════════════════
TZ-OPS-303: Docs Integrity Closeout — протокол «не забыть / не разъехать»
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: docs/process executor
ЗАВИСИМОСТИ: TZ-OPS-302 DONE (PROJECT-MEMORY уже в git)
LAYER: 1
CONFLICT KEYS: docs/DOCS-INTEGRITY.md; docs/FEATURE-INTEGRATION-CHECKLIST.md; docs/agent-checklists/_TEMPLATE.md; docs/PROJECT-MEMORY.md; docs/AI-AGENT-GUIDE.md; GEMINI.md; docs/agent-checklists/TZ-OPS-303.md; docs/agent-checklists/_active-map.md; tasks/_active/TZ-OPS-303.md; progress.md; tasks/_archive/2026-08/TZ-OPS-303.done.md

Проверено: docs/FEATURE-INTEGRATION-CHECKLIST.md §F; docs/agent-checklists/_TEMPLATE.md;
  docs/audits/2026-08-09-project-knowledge-integrity-analysis.md §3 P0/P1;
  docs/PROJECT-MEMORY.md (после 302)
Domain preflight: N/A (process/docs).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. FIC (`FEATURE-INTEGRATION-CHECKLIST.md`) уже MANDATORY для page/permission/module/MCP, но §F «Перед DONE» **не требует** явного слота в checklist агента → легко поставить READY без галочек.
2. `_TEMPLATE.md` имеет Claim / Acceptance / Gates / Executor report — **нет Integrity slot**.
3. Нет короткого протокола «какой doc обновлять при каком изменении» (`DOCS-INTEGRITY.md` отсутствует).
4. PROJECT-MEMORY (302) ссылается на integrity как будущий файл.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Создать `docs/DOCS-INTEGRITY.md`

Объём: **≤100 строк**. Содержание:

1. **Правило:** код + релевантные docs/списки = один PR/TZ; «потом допишем» = не DONE.
2. **Матрица триггер → файлы** (таблица), минимум:

| Изменение | Обязательно обновить |
|-----------|---------------------|
| Route / nav / chips | FIC §A + `docs/pages/<x>.page.md` + PAGE-TZ-INDEX / pages README |
| Permission / role seed | FIC §B + RU labels |
| Backend module API | FIC §C (+ page.md если UI) |
| User-visible section status | `SECTION-READINESS.md` |
| MCP / desktop tool | FIC §E + `desktop/docs/MCP.md` |
| Доменный SoT / write-path | page.md + при необходимости audit/vision; не молча менять канон |
| Только refactor без UX/API | progress + checklist; page.md если поведение UX изменилось |

3. **Integrity slot** — что агент обязан отметить в checklist перед READY FOR REVIEW / archive.
4. **Анти-дрейф:** при конфликте «doc vs code» — код + живой schema побеждают; doc чинится в той же TZ или сразу successor; запрещено оставлять заведомо ложный page.md.
5. Ссылки на FIC, PROJECT-MEMORY, DOMAIN-MAP `(OPS-304)`.

### ШАГ 2 — Integrity slot в `_TEMPLATE.md`

В шаблон checklist **после** `## Acceptance` (или перед Gates) добавь секцию:

```md
## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: page | permission | module | MCP | docs-only | other
- [ ] FIC §A–E пройдены **или** N/A с причиной одной строкой
- [ ] page.md / PAGE-TZ-INDEX обновлены **или** N/A (нет UI route)
- [ ] SECTION-READINESS обновлён **или** N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены
- [ ] Канон: docs/DOCS-INTEGRITY.md
```

Не ломай Claim slot и Executor report (auto) требования из tz-authoring skill.

### ШАГ 3 — Проводка FIC + Memory + GUIDE/GEMINI

1. `FEATURE-INTEGRATION-CHECKLIST.md` §F: добавь пункт  
   `- [ ] Integrity slot в checklist заполнен (см. docs/DOCS-INTEGRITY.md + _TEMPLATE.md)`.
2. `PROJECT-MEMORY.md`: замени заглушку OPS-303 на реальную ссылку `DOCS-INTEGRITY.md`; в «Не потерять» укажи Integrity slot.
3. `AI-AGENT-GUIDE.md` и/или `GEMINI.md`: **одна** короткая отсылка — перед DONE обязателен Integrity slot (не эссе).

### ШАГ 4 — Closeout

Checklist TZ-OPS-303 (с заполненным Integrity slot для docs-only) → progress → `_active-map` checkpoint → Executor report (auto) → archive.

---

## ИЗМЕНЯТЬ

- `docs/DOCS-INTEGRITY.md` (new)
- `docs/agent-checklists/_TEMPLATE.md`
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` (§F точечно)
- `docs/PROJECT-MEMORY.md` (ссылки)
- точечно GUIDE и/или GEMINI
- checklist / active-map / progress / archive

## НЕ ИЗМЕНЯТЬ

- Product code FE/BE/desktop
- DOMAIN-MAP (OPS-304)
- Массовый рефакторинг всех существующих checklist’ов волны SALES/DOC (не backfill)
- OrchestratorKit/AGENTS.md целиком (если нужна 1 строка — ок; иначе skip)

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] `docs/DOCS-INTEGRITY.md` ≤100 строк; есть матрица триггер→файлы + правило анти-дрейф
- [ ] `_TEMPLATE.md` содержит секцию **Integrity slot** с чекбоксами выше
- [ ] FIC §F содержит пункт про Integrity slot
- [ ] PROJECT-MEMORY ссылается на DOCS-INTEGRITY без «появится позже»
- [ ] GUIDE или GEMINI упоминает Integrity slot до DONE
- [ ] Нет product code diff
- [ ] Archive + Executor report (auto) + progress

Verification:

```text
rg -n "Integrity slot|DOCS-INTEGRITY" docs/agent-checklists/_TEMPLATE.md docs/FEATURE-INTEGRATION-CHECKLIST.md docs/PROJECT-MEMORY.md docs/DOCS-INTEGRITY.md GEMINI.md docs/AI-AGENT-GUIDE.md
powershell -Command "(Get-Content docs/DOCS-INTEGRITY.md).Count"
git status --short
```

---

## known_limitation

- Старые checklist’ы до 303 не обязаны ретро-заполняться.
- Автоскрипт drift routes↔page.md — не в этой TZ (optional successor).

ARCHIVE: `tasks/_archive/2026-08/TZ-OPS-303.done.md`. Docs-only self-archive OK после AC.
