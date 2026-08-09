# WAVE-KP-USABLE — Create КП доводим до «не стыдно»

**STATUS:** DONE — TZ-SALES-339 → 334 → 349 → 335 → 336 закрыты на canonical `main`.
339/334 приземлены merge'ем [`PROMPT-KP-USABLE-RESUME.md`](./PROMPT-KP-USABLE-RESUME.md), затем выполнены 349 (старые индексы `quotations`), 335 и 336.
**Канон:** [`docs/audits/2026-08-09-kp-usable-gap-map.md`](../../../docs/audits/2026-08-09-kp-usable-gap-map.md)  
**Промпт:** [`PROMPT-KP-USABLE-CONTINUOUS.md`](./PROMPT-KP-USABLE-CONTINUOUS.md)
**Deploy:** НЕ запускался; следующая волна WAVE-KP-COMPLETE только по отдельной команде PO.

| # | TZ | Суть (слова экрана) | State | Feature SHA | Closeout SHA | Archive |
|---|-----|---------------------|-------|-------------|--------------|---------|
| 0 | **337** | Параметры без дубля «Таблица» | DONE | `0d3ea7fa` | `0d3ea7fa` | `TZ-SALES-337.done.md` |
| 1 | **333** | Save API черновика | DONE | `b1d51453` | `cc4ffd87` | `TZ-SALES-333.done.md` |
| 2 | **338** | Редактировать/Создать → студия | DONE | `fb04b056` | `fb04b056` | `TZ-SALES-338.done.md` |
| 3 | **339** | Автосохранение + удаление из списка (+ hotfix `8a3186f1`) | DONE | `8a3186f1` | `e183a663` | `TZ-SALES-339.done.md` |
| 4 | **334** | Клиент = все контрагенты + поиск | DONE | `fa14bcec` | `fa14bcec` | `TZ-SALES-334.done.md` |
| 5 | **349** | Гигиена legacy-индексов quotations | DONE | `a16d2845` | `a16d2845` | `TZ-SALES-349.done.md` |
| 6 | **335** | Кол-во / цена / фото на листе | DONE | `d6bd43b9` | `592d5980` | `TZ-SALES-335.done.md` |
| 7 | **336** | Замок / оплачена / копировать | DONE | `b8edffd7` | `b8edffd7` | `TZ-SALES-336.done.md` |

**Merge landing:** `69752397` (339/334 closeouts on canonical `main`).
**Правило волны:** visual gate = агент сам (браузер + тесты); browser evidence and gates are recorded in each checklist. Не ждать PO mid-queue.
