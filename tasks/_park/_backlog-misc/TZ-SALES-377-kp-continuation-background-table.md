# TZ-SALES-377: Continuation pages — фон + таблица

> **UNPARKED** 2026-08-19 → executable copy:
> `tasks/_backlog/kp-vitrine/TZ-SALES-377-kp-continuation-background-table.md`
> Wave: `WAVE-KP-PAGE-MODE-FINISH.md`

РОЛЬ: Full-stack DocumentTemplate continuation mode  
DEPENDENCIES: TZ-SALES-376 DONE + PO PASS on real КП overflow

## Intent

Страницы 2+ КП: не полный повтор всех декоративных блоков страницы 1, а
**фон шаблона + блок таблицы позиций** (+ итог/условия на последней).  
Не «другой DocumentTemplate на каждую страницу» (это отдельный продукт builder page 2+).

## When to unpark

После того как 376 даёт стабильный split по рамке, и PO всё ещё хочет чище
continuation (без логотипов/текстов на каждой промежуточной странице).

## Out of scope forever for this TZ

- Multi-template picker «шаблон для стр. 1 / 2 / 3»
- Real `layout.page = 2+` canvas в builder
