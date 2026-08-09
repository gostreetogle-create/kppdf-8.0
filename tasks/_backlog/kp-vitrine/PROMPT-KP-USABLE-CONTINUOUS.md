# Промпт — WAVE-KP-USABLE (отдать после «можно» от Cursor)

Скопируй агенту целиком. Без «ок/поехали». Deploy не запускать.

**Слова экрана (для людей):** Сделки → Создать КП; справа иконки Параметры / Таблица; список КП на Сделки → КП.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main.
Канон: docs/audits/2026-08-09-kp-usable-gap-map.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-USABLE.md
GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
Deploy НЕ запускать.
НЕ коммитить: DOC-343 dirty WIP; system-role.guard* / roles-admin*.

Язык UI = русский. Запрещены user-visible EN: draft/Save/Estimate → «черновик»/«Сохранить КП»/«оценка».
С пользователем и в отчётах — слова экрана: «Сделки», «Создать КП», «Параметры», «Таблица», «КП удалено».

PO подтвердил боль (можно стартовать без повторного Save-квеста):
- «Сохранить» спрятана под НДС в Параметрах — непонятна; в Таблице/Товарах нет.
- Нужно АВТОСОХРАНЕНИЕ черновика КП (не только lastTemplate в localStorage).
- Удаление в списке КП: тост «КП удалено», строка остаётся (soft-delete без filter) — ЧИНИТЬ.
- Редактор = только студия Создать КП, не диалог.
- Клиент = все контрагенты + поиск; таблица qty/фото дальше по очереди.

ОЧЕРЕДЬ (строго):

0) CLOSE TZ-SALES-333
   feature b1d51453 → archive/lock/remove _active → map + progress → push metadata.
   known: кнопка была неочевидна; дожим UX в 339.

1) TZ-SALES-338 — tasks/_backlog/kp-vitrine/TZ-SALES-338-kp-edit-opens-studio.md
   Список Создать/Редактировать → /proposals/create (?id=). Убрать form-диалог. RU copy.

2) TZ-SALES-339 — tasks/_backlog/kp-vitrine/TZ-SALES-339-kp-save-autosave-delete.md
   «Сохранить КП» на виду; автосохранение draft; findAll без soft-deleted; resume не поднимает удалённый.

3) TZ-SALES-334 — tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md
   Клиент = ВСЕ Counterparty, без фильтра роли; OverflowSelect + searchable.

4) TZ-SALES-335 — tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md
5) TZ-SALES-336 — tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md

На каждую: CLAIM → code → gates → Executor report (auto) → archive/lock → commit+push → next.
Visual STOP: 338 (правка из списка), 339 (удаление + автосохранение + кнопка), 334, 335, 336.
После PASS в чате — сразу archive и next.

BAN: FROZEN 317; PDF/print 320; второй редактор; invent mid-queue; чужой WIP.

Финал: таблица TZ→SHA 333+338+339+334+335+336. NEXT idle.
Потом НЕ сейчас: PROMPT-KP-CHAIN-E2E-RESEARCH.md
Deploy NO.
```
