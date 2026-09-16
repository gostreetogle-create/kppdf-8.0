# Synthesis — DocStudio catalog tables peer review (2026-09-12)

**Вход:** ~8 успешных peer-ответов (2× Haiku Failed) на `PROMPT-PEER-DOCSTUDIO-CATALOG-TABLES-2026-09-12.md`  
**Аудит Cursor:** `docs/audits/2026-09-12-docstudio-catalog-tables-empty-audit.md`

---

## Consensus (почти единогласно)

| Тема | Вердикт peers |
|------|----------------|
| Q1 IA mismatch | **Да** — оператор ждёт N заполненных таблиц; код = 1 binding/kind + focus |
| Q4 bake liveRows в GET | **Не нужен** — надёжный `putDataSet` on load + after catalog Save |
| Q6 expand S15 на все unwired | **Опасно** — не делать magic auto-wire |
| Q8 прошлые фиксы | Локально верны (S47/48/heal/WYSIWYG/frame), **маскировали** корень IA |
| Слепые «ещё раз фото» | Не закрывают рецидив без IA |

## Split (важно)

| Q2 модель | Голоса (смысл) |
|-----------|----------------|
| **(a)** один буфер → все `catalog-products` таблицы = одни строки | Flash#1, GPT mini×2 — простота цеха |
| **(b)** у каждой таблицы свой subset | Flash#2/#3, DeepSeek×2 — гибкость «разные узлы на одном листе» |
| **(c)** Insert всегда клон с теми же selections | как поведение Insert, не полная модель данных |

**Q3 Insert:** почти все против silent focus-only → **всегда create** и/или явная **«Дублировать»**.

**Q5 Фото:** чаще «следствие пустой/не hydrate таблицы»; нужен **proof**: одна wired таблица + файл на диске + re-put после Save фото. Orphan disk остаётся отдельным PARK.

---

## Вердикт Cursor (финал)

1. **Корень = IA + wire/hydrate**, не «сломался рендер фото».  
2. Для цеха ~10 чел **фаза 1** (закрывает скрин PO без перестройки модели):  
   - оставить **(a) глобальный буфер** на документ;  
   - изменить Insert: **не** early-return focus → **создавать новую** таблицу с тем же `catalog-*` (или «Дублировать» + toast если уже есть);  
   - при open + после Save каталога/фото — **гарантированный** refresh всех blocks с matching `dataSource`;  
   - UI: на таблице без source — явный «Источник: витрина» / пустое состояние «не привязана».  
3. **(b) per-table subset** — **фаза 2**, только если PO ответит «нужны разные наборы изделий на разных таблицах одного документа». Иначе не делать (объём и риск).  
4. Expand S15 на все unwired — **нет**.  
5. VITRINA-EDIT (кнопка Изменить) — **после** фазы 1 hydrate/Insert (иначе «добавил фото — на пустой таблице не видно»).

---

## WAVE (фаза 1) — executable после Да/Нет PO

| # | ID | SIZE | Суть |
|---|-----|------|------|
| 1 | TZ-NX-DOCSTUDIO-CATALOG-INSERT-CREATE | S | Insert catalog table: always create+wire (или Duplicate); убрать silent focus-only; toast |
| 2 | TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL | M | On load + after catalog/photo Save: putDataSet **всех** blocks с matching `catalog-*`; revision queue |
| 3 | TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE | S | Manual/unwired table: честный empty «Нет источника — выберите в Свойствах / Вставить из Выбрано» |
| 4 | TZ-NX-DOCSTUDIO-VITRINA-EDIT | M | Уже есть черновик — кнопка Изменить (после 1–2) |

Фаза 2 (опц.): `TZ-NX-DOCSTUDIO-PER-TABLE-SELECTIONS` — только после PO «да, разные subsets».

---

## One sentence to PO

Peers сошлись: чинили клетки/фото, а ломает **контракт «одна вставка = одна живая таблица»**; сначала чиним Insert+hydrate при общем буфере, отдельные списки на таблицу — только если скажешь «да».

---

## PO lock 2026-09-12T23:05

PO: не усложнять; выбор изделий → **всегда одна** таблица kind; несколько одинаковых не нужны; per-table subset **не понадобится**.  
→ Фаза 1: INSERT-HONEST (focus+toast) + HYDRATE-ALL + UNWIRED-EMPTY + VITRINA-EDIT. Фаза 2 cancelled.
