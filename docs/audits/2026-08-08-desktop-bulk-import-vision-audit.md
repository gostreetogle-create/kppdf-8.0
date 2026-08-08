# Desktop bulk-import vision audit

**Дата:** 2026-08-08  
**Скоуп:** `desktop/`, `desktop/mcp/`, BE `import-task` + `mutation-journal`, park `tasks/_park/desktop/`, vision `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`  
**Метод:** сверка формулировки PO (оптовый Excel → структура → HITL → SoT + опц. формы/todos) с кодом и DONE/PARK TZD  
**Исполнение кода:** нет (Mode A)

Связанные TZ: `tasks/_park/desktop/TZD-23…29*`, wave `docs/agent-checklists/SESSION-WAVE-2026-08-08-desktop-bulk-import.md`

---

## Verdict

Фундамент десктопа **в правильном направлении**: pairing, MCP-розетка, inbox parse, ImportTask как точка сборки, propose/confirm/undo в SoT **без второй БД**. Это совпадает с Variant C из PO-DIARY и с севером «один Nest/Mongo».

Против полной картины PO (кинул кучу Excel/доков → ready/unfit → ИИ деформирует под схему → продукты/заказы/КП → при нахождении печатных форм создаёт шаблоны + todos менеджеру) продукт сейчас **material-only pipe с припаркованным мозгом**: matching/HITL (TZD-23), multi-entity writes, doc-constructor MCP и manager todos — **GAP**. Направление не ломать; не раздувать expert propose; дожимать линию **22 → 23 → 26 → 18 → 27…**.

| Area | Status | Note |
|------|--------|------|
| Install + pairing (`kppd_…`) + web dialog | **PASS** | TZD-05/16/21/24 |
| MCP host + Cursor/LM Studio mcp.json | **PASS** | Нужен system Node; sidecar не bundled |
| Inbox drop → Excel/CSV/TXT | **PASS** | PDF stub; 1-й лист Excel |
| ImportTask (`import_tasks`) | **PASS** | Оркестрация, не SoT |
| Column ready / AI reshape | **GAP** | Только alias heuristics |
| Matching + HITL → propose | **GAP** | TZD-23 PARK; `aiReport` пустой |
| Batch 1k–10k | **GAP** | Cap 500; TZD-18 PARK |
| Propose/confirm materials | **PASS** | Journal kinds material.* only |
| Products / orders / КП writes | **GAP** | Products slim read |
| Doc-constructor MCP + manager todos | **GAP** | Веб-конструктор есть; MCP tools нет |
| In-app AI (`pipeline.ts`) | **STUB** | Не блокер, если Cursor/LM Studio в розетке |
| SoT / no second DB | **PASS** | |
| Docs freshness (README tree) | **DRIFT** | Часть «стабы» устарела |

---

## PO vision → current mapping

| Шаг PO | Ожидание | Сейчас | Пути |
|--------|----------|--------|------|
| Скачал десктоп | ZIP/installer с того же хоста | DONE TZD-24 | `desktop/docs/INSTALL.md` |
| Подключил аккаунт / MCP | Pairing key → `/auth/me` | DONE | `PAIRING.md`, `pairing.ts` |
| Cursor / LM Studio | mcp.json fragment | DONE TZD-20 | `mcpClientSnippet.ts` |
| Кинул файлы | Inbox | DONE xlsx/csv/txt; PDF stub | `inbox.ts`, `importers/*` |
| Структурирует под ERP | Нормализация по схемам сущностей | PARTIAL: material-shaped | `mapRowToMaterial`, `domain-schema.ts` |
| Колонки ready / unfit | Явные флаги | MISSING | aliases only |
| Unfit → AI reshape (смысл тот же) | Задача reshape → re-audit | MISSING | — |
| Заливка в БД (материалы, продукты, заказы, КП) | Propose → confirm | Только **материалы** | `write-tools.ts`, journal schema |
| Нет параллельных таблиц Excel | SoT = Nest | PASS (`import_tasks` = очередь) | |
| Печатные формы без шаблона | Doc-constructor MCP + todo менеджеру | MISSING | веб `/doc-constructor/*` отдельно |
| MCP заполняет «правильные места» | Tools + HITL | PARTIAL: нет plan/HITL | `tools.ts` |

ERP north (КП→Заказ→цех): `docs/audits/2026-08-08-sales-to-shop-flow-canon.md` — десктоп **пока не кормит** этот поток; сначала каталог (материалы → изделия).

---

## What works today

- **DONE stream:** TZD-00, 05, 11–17, 20–22, 24 (archives + checklists).
- **UI:** pairing, MCP card, inbox scan/parse, «Создать задачу для ИИ», expert propose, confirm/cancel.
- **MCP tools:** ping/reads; domain validate; inbox list/audit/propose; import_task CRUD/status; material propose/confirm/undo.
- **Safety:** propose ≠ SoT; undo ring; org/RBAC; ImportTask не спамит journal (TZD-22).

---

## Gaps / smells (P0–P2)

### P0

1. **TZD-23** — нет matching/HITL; статус `ready_for_ai` тупик для агента без протокола.
2. **Write surface = materials only** — PO назвал продукты/заказы/КП; journal не умеет.
3. **Нет ready/unfit + reshape** — aliases ≠ классификация колонок.
4. **Expert propose** всё ещё может залить N unmatched proposals (PO smell 2026-08-08).

### P1

5. In-app pipeline stub (TZD-01/02) — опционально после 23.
6. Batch/scale TZD-18.
7. BOM/where_used TZD-19 перед product mass-write.
8. Doc-constructor MCP + manager todos.
9. Node dependency для MCP; ZIP на стенде только после PO deploy.
10. PDF / multi-sheet / photos в Excel.

### P2

11. README/park DRIFT (TZD-21/24 ещё в Open).
12. `entities.md` богаче runtime domain.
13. Путаница «proposal» (journal) vs КП (`/proposals`).
14. Нет web UI очереди ImportTask (осознанный out-of-scope TZD-22).

---

## Recommended succession

| # | ID | Intent | Когда |
|---|-----|--------|-------|
| 1 | **TZD-23** | Matching + HITL plan → propose (materials) | После DETAIL-wave / по «делай TZD-23» |
| 2 | **TZD-26** | Column ready/unfit + reshape | После 23 |
| 3 | **TZD-18** | Batch propose/confirm, lift 500 | После 23 |
| 4 | **TZD-27** | Journal `product.*` (+ опц. counterparty) | После 23+19 soft |
| 5 | **TZD-19** | BOM / where_used | Перед/с 27 |
| 6 | **TZD-28** | Doc-constructor MCP draft | После стабильного каталога |
| 7 | **TZD-29** | Manager finish-todos | С/после 28 |
| — | Orders / КП import | **Defer** | Пока HITL каталога не живёт |
| — | PDF TZD-04 | Defer | |

---

## Out of scope / do not build

- Вторая SoT / local Mongo / Excel-mirror  
- Silent SoT write без propose/confirm  
- Auto-write `~\.cursor\mcp.json`  
- Bundled LLM в MSI как обязательный  
- Order/КП bulk до materials+products HITL  
- EAV «поля из воздуха»  
- Gantt/production write из import wave  
- Auto-deploy desktop ZIP без команды PO  

---

## Architecture (as-is)

```text
[Excel/CSV] → Desktop inbox parse (aliases)
        ├─ expert → N× material.create proposals → confirm → Materials SoT
        └─ «Задача для ИИ» → ImportTask (ready_for_ai)
                              └──✗ matching/HITL (TZD-23)
                              └──✗ product/order/КП / docs
[Cursor/LM Studio] ⇄ MCP (Node) ⇄ Nest REST (RBAC)
```

**Вердикт одной фразой:** розетка и контейнер готовы; мозг импорта (сверка + HITL + мульти-сущности + формы) — следующий этап, не переписывание архитектуры.
