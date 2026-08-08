# Промпт новому агенту (копируй целиком)

**Сейчас (не трогать чужое):**
- FACT-304 IN WORK → `materials/**`, `fact-card/**`
- PRODUCTS-307 IN WORK → `products.page.*` (уже claimed — **не брать**)

**Тебе:** COMPOSE-301 → DIALOG-305 → (потом 337 / 304). Это как раз то, на что жалуется PO: материал в модуле + ширина диалогов.

---

```
Ты исполнитель kppdf-8.0. SoT: D:\kppdf-8.0 на ветке main.
Прочитай целиком: GEMINI.md, OrchestratorKit/AGENTS.md, docs/PO-DIARY.md §1–§4,
tasks/_backlog/catalog-ux-c/WAVE-CATALOG-UX-C.md.

ЦЕЛЬ ВОЛНЫ (PO P0): не заставлять PO лазить по страницам.
1) В модуль можно добавить модуль ИЛИ материал — это должно быть очевидно.
2) Большие catalog-диалоги = ширина эталона kind C: min(1120px, 100vw-2rem) как у материала.
3) Карточка материала = A+ как изделие/модуль (отдельный TZ позже).

КАНОН СОСТАВА:
- Модуль → модуль | материал
- Изделие → изделие | модуль (материал/«деталь» в UI не убирать)
- Состав пишется ТОЛЬКО через BomPanel на карточке / QuickCreate L.
- НЕ воскрешать ModuleMaterialsFormDialog / второй write-path состава.

ЖЁСТКИЙ ПОРЯДОК ДЛЯ ТЕБЯ:
A) Сначала TZ-UX-COMPOSE-301
   файл: tasks/TZ-UX-COMPOSE-301-module-composition-discoverability.md
   checklist: docs/agent-checklists/TZ-UX-COMPOSE-301.md
   Сделай: hint «Состав» в ModuleForm; пикер restrictToModule открывается на вкладке Материал;
   «+ В корень модуля» доступна даже если выбран материал в дереве; docs+tests; archive; commit+push.

B) Потом TZ-UX-DIALOG-305
   файл: tasks/TZ-UX-DIALOG-305-catalog-kind-c-width-parity.md
   checklist: docs/agent-checklists/TZ-UX-DIALOG-305.md
   Сделай: ModuleForm + composition picker = maxWidth min(1120px, calc(100vw - 2rem));
   audit note + cookbook; tests; archive; commit+push.

C) Потом проверь tasks/_active/:
   - Если TZ-UX-FACT-304 ещё IN WORK → НЕ трогай materials/**; скип TZ-CATALOG-337.
   - Если FACT-304 уже archived DONE → делай TZ-CATALOG-337
     (tasks/TZ-CATALOG-337-material-detail-a-plus.md) — A+ shell материала.
   - TZ-PRODUCTS-307 уже CLAIMED другим → НЕ брать, не править products.page.*.
   - Потом TZ-UX-DIALOG-304 если свободен.

ЦИКЛ НА КАЖДЫЙ TZ: claim → код → gates из TZ → archive → commit+push main → next.
Без стопов «ок / поехали / жду подтверждения». Deploy запрещён без явной команды PO.
Чужой dirty WIP вне своих CONFLICT KEYS не коммитить.
Team Room: join + inbox + claim по возможности; если CLI unavailable — всё равно работай по файлам _active/checklist.

BAN: desktop/**, TZD-*, supply/import-task/mutation-journal, SALES-304, Gantt, deploy.ps1,
воскрешение ModuleMaterials, перехват FACT-304 / PRODUCTS-307.

СТАРТ СЕЙЧАС: claim COMPOSE-301 и выполняй до archive+push, затем DIALOG-305.
```
