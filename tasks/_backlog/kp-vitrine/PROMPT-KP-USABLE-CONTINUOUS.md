# Промпт — WAVE-KP-USABLE остаток (после visual 333)

Скопируй агенту **после** проверки Save (кнопка!) → F5.  
Без стопов «ок/поехали». Deploy не запускать.

**Важно PO:** F5 **не** автосейв. Сначала **Сохранить** (toast «Черновик сохранён»), потом F5.  
НДС % в Параметрах = к **нашей фирме** (Organization) на это КП — ок, не ломать.  
Таблица qty/фото — в **335**, не «сломана кнопка Видна».

**Уже DONE:** 337; 333 feature `b1d51453`.  
**Осталось:** archive 333 → **338** (правка только в студии + RU) → 334 → 335 → 336.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main.
Канон дыр: docs/audits/2026-08-09-kp-usable-gap-map.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-USABLE.md
GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
Deploy НЕ запускать.
НЕ коммитить: DOC-343 dirty WIP; system-role.guard* / roles-admin* (чужая правка).

UI = русский. В user-visible тексте ЗАПРЕЩЕНЫ англ. слова вроде draft/Save/Estimate —
только RU («черновик», «Сохранить», «оценка»). Код/API enum draft не трогать.

ПРЕДУСЛОВИЕ: PO подтвердил visual 333 ИМЕННО так:
/proposals/create → шаблон → товар → кнопка «Сохранить» → toast «Черновик сохранён» → F5
→ товары и шаблон на месте. (Без кнопки Save на F5 ничего не будет — это норма.)
Если PASS не подтверждён — STOP.

ОЧЕРЕДЬ (строго):

0) CLOSE TZ-SALES-333
   feature SHA b1d51453 → archive/lock/remove _active → _active-map + progress
   commit+push closeout только metadata. Без чужого WIP.

1) TZ-SALES-338 — tasks/_backlog/kp-vitrine/TZ-SALES-338-kp-edit-opens-studio.md
   Список: Создать/Редактировать → /proposals/create (query ?id=).
   Убрать ProposalFormDialog из CRUD КП. Hydrate by id.
   RU: вычистить «draft» и прочий EN из подсказок Create.

2) TZ-SALES-334 — tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md
   Клиент = ВСЕ Counterparty без фильтра роли; OverflowSelect + searchable auto; в Save.

3) TZ-SALES-335 — tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md
   Кол-во/цена/сумма на экземпляре таблицы + qty edit + photoUrl.

4) TZ-SALES-336 — tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md
   Замок / «Оплачена» / копировать.

На каждую: CLAIM → code → gates → Executor report (auto) → archive/lock → commit+push → next.
Visual STOP: 338 (edit из списка), 334 (клиент), 335 (qty+photo), 336 (lock).
После PASS в чате — сразу archive и next.

BAN: autosave вместо кнопки Save; второй редактор-диалог КП; FROZEN 317 shell;
print/PDF 320; invent mid-queue; чужой dirty WIP.

Финал: таблица TZ→SHA→archive 333+338+334+335+336. NEXT idle.
Потом (НЕ сейчас): PROMPT-KP-CHAIN-E2E-RESEARCH.md
Deploy NO.
```
