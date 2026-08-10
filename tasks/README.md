# Tasks — канон порядка

| Папка / файл | Что здесь |
|--------------|-----------|
| **`PROMPT-RESUME-ANY.md`** | Единственный промпт «продолжи / новый чат Buffy» |
| **`PROMPT-UNIVERSAL-CONTINUOUS.md`** | Полный канон исполнителя (редко; обычно хватает RESUME-ANY) |
| **`_active/`** | Сейчас в работе (0–1 claim) |
| **`_backlog/`** | Живая очередь: незакрытые TZ + WAVE |
| **`_park/`** | Отложено; не брать без PO |
| **`_archive/`** | Сделано / отработанные промпты / старые волны |

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../docs/PO-AGENT-FLOW.md)  
**Опасные ops:** [`docs/ops/DANGEROUS-OPS.md`](../docs/ops/DANGEROUS-OPS.md)

## Правила гигиены

1. В **корне `tasks/`** не хранить одноразовые `PROMPT-*` и копии уже закрытых TZ.  
2. Отработанный промпт волны → `_archive/YYYY-MM/prompts-spent/`.  
3. Закрытая TZ → `_archive/YYYY-MM/<TZ>.done.md` (+ lock); исходный spec можно убрать в `waves-done/` или `specs-dup-root/`.  
4. Папки `tasks/prompts/` **нет** — не возрождать; живые промпты только: корень (2 файла) или рядом с живой WAVE в `_backlog/`.  
5. Пустые папки не оставлять.

## Сейчас в `_backlog/` (ожидаемо тонко)

- `QUEUE.md` — карта  
- `kp-vitrine/` — хвост **WAVE-KP-COMPLETE** (сейчас TZ-SALES-348 + continuous prompt)  
- `ops/` — **TZ-OPS-310** (gate перед деплоем)  
- `perf/` — WAVE-PERF-PHOTOS (если ещё актуальна)
