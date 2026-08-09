# Промпт — WAVE-KP-USABLE остаток (333 archive → 334→335→336)

Скопируй агенту **после** своего visual PASS на Save/F5 (333).  
Без стопов «ок/поехали». Deploy не запускать.

**Уже DONE:** 337 (дубль таблицы), 333 feature `b1d51453` (Save/resume) — на `origin/main`, ждёт только archive после PASS.  
**Осталось:** закрыть 333 → клиент → кол-во/фото → замок.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main.
Канон дыр: docs/audits/2026-08-09-kp-usable-gap-map.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-USABLE.md
GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
Deploy НЕ запускать.
НЕ коммитить: DOC-343 dirty WIP; system-role.guard* / roles-admin* (чужая правка админ-ролей).

ПРЕДУСЛОВИЕ: PO уже сделал visual PASS 333
(/proposals/create → шаблон → товар → Сохранить → F5: toast «Черновик сохранён»,
товары и шаблон на месте). Если PASS в чате НЕ подтверждён — STOP, не archive.

ОЧЕРЕДЬ (строго, без mid-queue фич):

0) CLOSE TZ-SALES-333
   - checklist + Executor report (auto) с feature SHA b1d51453 (+ closeout SHA)
   - archive → tasks/_archive/2026-08/TZ-SALES-333.done.md
   - lock + удалить tasks/_active/TZ-SALES-333.md
   - _active-map + progress.md
   - commit+push closeout (только metadata 333; без чужого WIP)

1) TZ-SALES-334 — tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md
   Клиент (Counterparty) в Параметрах; значение в Save/resume; убрать stub.
2) TZ-SALES-335 — tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md
   Кол-во/цена/сумма на экземпляре таблицы + qty edit + photoUrl в Рисунок.
3) TZ-SALES-336 — tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md
   Замок бланка / «Оплачена» hard-lock / копировать КП.

На каждую TZ: CLAIM (_active + checklist _TEMPLATE) до кода → gates →
Executor report (auto) → archive/lock/remove _active → commit+push → next.
Visual STOP (READY handoff, не invent «ок?»):
  - 334: лёгкий — выбрать клиента → Save → reopen клиент на месте
  - 335: qty + photo на листе A4
  - 336: lock / оплачена / copy
После PASS в чате — сразу archive и next. Не ждать новой волны.

BAN: FROZEN A4 overlay shell 317; print/PDF 320; invent mid-queue;
трогать чужие dirty файлы выше.

Финал волны: таблица TZ→SHA→archive для 333–336. NEXT idle.
Потом (НЕ сейчас): tasks/_backlog/kp-vitrine/PROMPT-KP-CHAIN-E2E-RESEARCH.md
Deploy NO.
```
