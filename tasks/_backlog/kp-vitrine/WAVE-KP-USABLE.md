# WAVE-KP-USABLE — Create КП доводим до «не стыдно»

**STATUS:** IN FLIGHT — close 339 (self-verify) → 334 → 335 → 336 → DONE  
**Канон:** [`docs/audits/2026-08-09-kp-usable-gap-map.md`](../../../docs/audits/2026-08-09-kp-usable-gap-map.md)  
**Промпт (до конца, self-verify):** [`PROMPT-KP-USABLE-CONTINUOUS.md`](./PROMPT-KP-USABLE-CONTINUOUS.md)  
**Deploy:** только по команде PO

| # | TZ | Суть (слова экрана) | State |
|---|-----|---------------------|-------|
| 0 | **337** | Параметры без дубля «Таблица» | DONE |
| 1 | **333** | Save API черновика | DONE |
| 2 | **338** | Редактировать/Создать → студия | DONE |
| 3 | **339** | Автосохранение + удаление из списка (+ hotfix `8a3186f1`) | CLOSE (self-verify → archive) |
| 4 | **334** | Клиент = все контрагенты + поиск | NEXT after 339 |
| 5 | **335** | Кол-во / цена / фото на листе | queued |
| 6 | **336** | Замок / оплачена / копировать | queued |

**Правило волны:** visual gate = агент сам (браузер + тесты). Не ждать PO mid-queue.
