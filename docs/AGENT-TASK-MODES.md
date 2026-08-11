# Agent task modes — дисциплина задачи (без лишней церемонии)

> **Зачем:** полный TZ/OrchestratorKit — для содержательной работы; мелкие правки не должны раздуваться, а крупные — не закрываться по «зелёному tsc».  
> Идея адаптирована из vibe `AGENTS.md` (task modes + primary/secondary signal).  
> **Обновлено:** 2026-08-11.

Связано: [`AI-AGENT-GUIDE.md`](./AI-AGENT-GUIDE.md) · [`CAPABILITY-LEDGER.md`](./CAPABILITY-LEDGER.md) · [`FEATURE-INTEGRATION-CHECKLIST.md`](./FEATURE-INTEGRATION-CHECKLIST.md) · CLAIM в `_TEMPLATE.md`.

---

## 1. Режимы (выбрать один до правок)

| Mode | Когда | Что делать |
|------|-------|------------|
| **Review** | PO просит оценку / smell / «посмотри» без правок | Только evidence + риски + пути файлов. Код не трогать. |
| **Direct** | Косметика, копирайт, spacing, очевидный локальный фикс без смены поведения | Минимальный diff + узкая проверка. Без полного TZ, если PO не потребовал. |
| **Investigation** | Баг / непонятный failure path | Воспроизвести/проследить вертикаль; **2 неудачные попытки** без сдвига сигнала → переформулировать, не крутить дальше. |
| **TDD-first** | Поведение, контракты, auth, permissions, persistence, валидация, навигация, state transitions | Сначала важные fail/success/boundary кейсы → минимальный фикс → green → только нужные edge. |
| **TZ-exec** | Есть `tasks/TZ-*` / wave | Полный CLAIM → код → gates → Integrity → archive по `GEMINI.md`. |

Frontend visual-only → **Direct**, не TDD-first, пока не меняются a11y-семантика, навигация, валидация, permissions, persistence.

Для нетривиальной работы вне готового TZ: 3–5 наблюдаемых AC **до** правок (или попроси Cursor написать TZ).

---

## 2. Acceptance: primary vs secondary signal

| Сигнал | Что это | Правило |
|--------|---------|---------|
| **Primary** | Пользовательски видимое поведение или runtime (экран, API ответ, smoke) | Без primary ≠ DONE |
| **Secondary** | tsc / lint / jest / architecture:check / docs | Нужны, но **не заменяют** primary |

В checklist / финальном отчёте явно:

```text
Primary signal: <…> — met | not met | partial
Secondary: <команды + exit> — PASS|FAIL
```

Не объявлять успех по proxy-метрикам, если primary сломан.

---

## 3. Change-surface triggers

Перед патчем «в одном файле» проверь соседей:

| Трогаешь | Ещё проверь |
|----------|-------------|
| API / DTO / schema | FE client/service, serializers, seeds, тесты обеих сторон |
| Route / guard / capabilities | `app.routes`, nav, RBAC labels, FIC §A–E, page.md |
| Query/mutation / silent-http | loading / empty / error / retry / F5 |
| Auth / session / tokens | guards, interceptors, desktop/`X-Access-Token`, Basic coexist |
| Composition / BOM write-path | один opener → тот же panel; не второй UI в ту же таблицу |
| Async / jobs / uploads | retry, idempotency, видимость ошибки пользователю |
| Deploy / nginx / auth edge | `docs/ops/*`, не ломать SPA JWT ради Basic |

Вертикаль research: UI → route/guard → page/service → API → schema/persistence.

---

## 4. Решает агент / спрашивает PO

**Не спрашивать PO (агент решает и кратко объясняет эффект):**

- куда класть файл в существующей структуре Nest/Angular;
- имя локальной функции / тест / узкий рефактор в CONFLICT KEYS;
- какой secondary gate гонять для зоны;
- Paper & Ink / RU copy по канону PO-DIARY;
- monolit vs «давай микросервис» → всегда монолит, пока ledger не скажет иначе.

**Спросить PO (коротко, варианты A/B + рекомендация):**

- новая capability из ledger `absent`/`removed`;
- ломающая миграция SoT / unique / wipe;
- deploy / VPN / production destructive;
- смена IA меню, ролей, видимого процесса цеха;
- новая зависимость в package.json.

---

## 5. Completion report (сжатый)

После нетривиальной работы (и в `## Executor report (auto)` по смыслу):

1. Что изменилось и почему (1–3 предложения).
2. Primary / Secondary status.
3. Docs/ledger/FIC: updated | n/a | drift.
4. Риски / follow-up.
5. Suggested commit message (если ещё не закоммичено).

Для **Direct** / **Review** — только релевантные поля.
