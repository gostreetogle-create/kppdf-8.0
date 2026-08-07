═══════════════════════════════════════════════════════════════
TZD-22: AI Import Task — точка сборки (модель + API + Desktop + MCP)
═══════════════════════════════════════════════════════════════

> READY · LAYER 2–4 (backend module + desktop + MCP) · **не** параллелить с
> другим TZ на `desktop/mcp/src/inbox*.ts` / `desktop/src/core/inbox.ts` /
> новым `backend/src/modules/import-task/**` без DEFER.
>
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> Trigger (PO 2026-08-08): нет «точки сборки» файл→ИИ. Сейчас Desktop парсит
> строки и сразу плодит `material.create` proposals **без matching** → дубли
> в journal; человек сверяет глазами; отдавать ИИ уже созданные proposals =
> мусор в контексте агента.
>
> Канон решения (Вариант C): **Import Task** между парсером и propose.
> ИИ = аналитик плана; propose/confirm = исполнение **после** ok человека.
> Matching + отчёт в чате — **не** этот TZ → TZD-23.

STATUS: READY (выдавать по «делай TZD-22»)

РОЛЬ АГЕНТА: Backend Nest (новая сущность) + Desktop (кнопка «Создать задачу для ИИ»)
+ MCP tools (list/get/create/set_status). Без авто-matching и без chat UX.

ЗАВИСИМОСТИ:
- TZD-13 DONE (mutation journal propose/confirm)
- TZD-15 DONE (inbox parse / propose rows)
- TZD-17 DONE (validate / audit / domain schema — использовать на чтении строк,
  **не** заменять собой Import Task)
- TZD-21 — **не** блокер (pairing TTL можно параллелить, другие conflict keys)

LAYER: 4 (новый BE module) + 2 (desktop/MCP)

PAGES: (web UI списка задач — **out of scope** этого TZ; см. known_limitation)
PAGE_DOCS: `desktop/docs/MCP.md`; `desktop/docs/INSTALL.md` или README — кратко
  про кнопку «Создать задачу для ИИ»

CONFLICT KEYS:
backend/src/modules/import-task/**;
backend/src/app.module.ts;
desktop/src/core/inbox.ts;
desktop/src/App.svelte;
desktop/mcp/src/inbox.ts;
desktop/mcp/src/inbox-tools.ts;
desktop/mcp/src/tools.ts;
desktop/mcp/src/import-task-tools.ts;
desktop/mcp/src/*.test.ts;
desktop/docs/MCP.md;
desktop/README.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md;
docs/agent-checklists/TZD-22.md;
tasks/_backlog/desktop/README.md;

---

## Domain preflight

| Говорят | Канон в коде |
|---------|----------------|
| Задача импорта / AI task / «контейнер» | **`ImportTask`** (collection `import_tasks`) — **не** Material, **не** mutation-journal proposal, **не** КП продаж |
| Черновик / proposal | `MutationJournal` status=`proposed` (`material.create` / `material.update`) |
| Материал | `Material` |
| Организация | `Organization` (org scope как у journal) |
| Inbox-файл | локальный файл на Desktop; в задаче — метаданные source, **не** обязательный blob в Mongo |

Проверено:
- `desktop/src/core/inbox.ts` — `proposeMaterialRows` → POST proposals per row, **no** matching
- `desktop/mcp/src/inbox-tools.ts` — `kppdf_inbox_propose_file` / `kppdf_inbox_audit_file`
- `backend/.../mutation-journal.schema.ts` — kinds только material.create|update
- Отдельной сущности Import Task / AI task в backend **нет**

Кардинальность:
- 1 ImportTask → N rows (embedded array; P0 лимит **≤500** строк на задачу, иначе 400 + hint «разбей файл / TZD-18»)
- 1 ImportTask → 0..N proposalIds (**только после** явного apply-плана в TZD-23; в этом TZ поле есть, заполнение — опционально пустое)
- Unique: `_id`; индекс `(organizationId, status, createdAt desc)` — **не** unique по имени файла

Loose wording: «proposal» в разговоре про импорт ≠ КП (`Proposal` продаж).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Desktop/MCP: разобрать файл → `proposeMaterialRows` / `kppdf_inbox_propose_file` → N proposals create. Matching с базой **отсутствует**.
2. `kppdf_inbox_audit_file` / validate — dry-run без journal, но **не** создают долгоживущую задачу в ERP; агент не может «взять задачу» из списка.
3. Человек = мозг сверки на экране; ИИ, если дать сырые proposals, видит дубли и «чинится» сам себе.
4. Нужна точка сборки: файл → **ImportTask + rows** → (позже) анализ ИИ → план → propose.

---

## ЧТО ДЕЛАТЬ (6 шагов)

### ШАГ 1 — Schema `ImportTask` (backend)

NEW `backend/src/modules/import-task/`:

Поля (имена можно чуть иначе, **смысл фиксирован**):

| Поле | Тип / смысл |
|------|-------------|
| `createdByUserId` | ObjectId, required, index |
| `organizationId` | ObjectId, index (как journal) |
| `source` | `{ fileName, fileType: 'xlsx'\|'csv'\|'txt'\|…, contentHash?: string, inboxPath?: string }` |
| `status` | enum: `draft` \| `ready_for_ai` \| `analyzing` \| `awaiting_user` \| `applying` \| `done` \| `cancelled` \| `failed` |
| `rows` | array: `{ rowIndex, raw: Record<string,string\|number\|null>, name?, unit?, article?, sku?, notes? }` |
| `summary` | string, optional — короткий label для списка («Закупка.xlsx · 50 строк») |
| `aiReport` | object \| null — **зарезервировано**; в этом TZ всегда `null` / omit (пишет TZD-23) |
| `proposalIds` | ObjectId[] — default `[]` (связь с journal после apply; TZD-23) |
| `errorMessage` | string, optional (при `failed`) |
| timestamps | createdAt / updatedAt |

Статусы при создании с Desktop: сразу **`ready_for_ai`** (или `draft`→сразу patch в `ready_for_ai` в одном запросе).  
Переходы в этом TZ (API `PATCH status`): только безопасные ручные:
- `ready_for_ai` ↔ `cancelled`
- `failed` ← из любого non-terminal при явной ошибке клиента
- `analyzing` / `awaiting_user` / `applying` / `done` — **разрешить** set_status для MCP (агент/человек), без авто-логики matching

Валидация: `rows.length` 1..500; `name` в row желателен (warn в summary, не hard-fail всего create).

### ШАГ 2 — REST API

Controller под JWT + org scope (как materials/journal):

| Method | Path | Поведение |
|--------|------|-----------|
| POST | `/api/import-tasks` | body: source + rows (+ optional summary); status=`ready_for_ai` |
| GET | `/api/import-tasks` | list: filter status?, page/limit; **без** полного rows в list (или rows truncated) — отдать `id, source.fileName, status, summary, rowCount, createdAt` |
| GET | `/api/import-tasks/:id` | полная задача включая rows |
| PATCH | `/api/import-tasks/:id/status` | `{ status, errorMessage? }` с whitelist переходов (см. шаг 1) |
| DELETE или POST cancel | мягкая отмена → `cancelled` (предпочтительно status, не hard delete) |

**НЕ** вызывать Material.create / propose из этого модуля.

RBAC: те же права, что позволяют propose materials (или `materials:write` / существующий permission — сверить с journal controller и зафиксировать в checklist).

### ШАГ 3 — Desktop: «Создать задачу для ИИ»

В inbox UX (`App.svelte` + `desktop/src/core/inbox.ts`):

1. После разбора файла (уже есть audit/parse) — кнопка **«Создать задачу для ИИ»** (RU).
2. Действие: POST `/api/import-tasks` с нормализованными rows (тот же column mapping, что для propose), `source.fileName` / type / optional hash.
3. Успех: показать id + summary + статус `ready_for_ai`; **0** новых proposals в journal.
4. Кнопку **«Предложить строки»** (expert / без ИИ) **оставить** — не удалять; в UI подпись/hint: «без сверки с базой — только черновики».

Опционально: после create сдвинуть файл в `processed/` **только** если PO-flow inbox уже так делает для propose; иначе — documented: файл остаётся до ручного processed (не блочить AC).

### ШАГ 4 — MCP tools

NEW `desktop/mcp/src/import-task-tools.ts` (+ register в `tools.ts`):

| Tool | Поведение |
|------|-----------|
| `kppdf_import_task_list` | GET list (status filter, limit) |
| `kppdf_import_task_get` | GET by id (full rows) |
| `kppdf_import_task_create` | POST create (для агента/скрипта; Desktop тоже может ходить REST напрямую) |
| `kppdf_import_task_set_status` | PATCH status |

Описания tools (RU/EN short): задача **не** пишет SoT; matching/propose — следующий шаг (TZD-23); сейчас агент **читает** задачу и может ходить в `list_materials` / `validate`, но **не обязан** в этом TZ автоматически propose.

Тесты: register names; create/list мокают REST.

### ШАГ 5 — Docs + checklist feature

- `desktop/docs/MCP.md` — таблица новых tools + схема потока:
  `file → ImportTask → (TZD-23: match+plan) → propose → confirm`
- `desktop/README.md` — одна фраза про кнопку задачи ИИ vs propose
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` — строка TZD-22
- `docs/agent-checklists/TZD-22.md` по `_TEMPLATE.md`

### ШАГ 6 — Gates + report

См. AC. Перед archive — `## Executor report (auto)` (≤15 lines).

---

## ИЗМЕНЯТЬ

- `backend/src/modules/import-task/**` (new)
- `backend/src/app.module.ts` (register module)
- `desktop/src/core/inbox.ts`, `desktop/src/App.svelte` (create task path)
- `desktop/mcp/src/import-task-tools.ts`, `tools.ts`, inbox-tools только если нужен тонкий cross-link (предпочтительно **не** ломать propose)
- docs listed in CONFLICT KEYS

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

1. **Не** реализовывать AI matching / классификацию new|update|skip|doubt (→ TZD-23).
2. **Не** авто-вызывать `propose_material_*` из ImportTask create или set_status.
3. **Не** удалять expert-path `proposeMaterialRows` / `kppdf_inbox_propose_file`.
4. **Не** трогать sales Proposal / Orders / BOM / TZD-18 batch API / TZD-19 graph.
5. **Не** обязательный web UI список задач в ERP (API достаточно; UI → successor).
6. **Не** хранить целый xlsx blob в Mongo (только meta + rows).
7. **Не** менять канон journal (propose≠SoT).

---

## КРИТЕРИИ ПРИЁМКИ

1. POST import-task с 3 mock-rows → документ в Mongo, status=`ready_for_ai`, **0** новых `mutation_journal` proposed от этого вызова.
2. GET list возвращает summary/rowCount без обязательной полной rows-простыни; GET :id — все rows.
3. Desktop: «Создать задачу для ИИ» создаёт задачу; «Предложить строки» по-прежнему создаёт proposals (regression).
4. MCP: четыре tool names зарегистрированы; list/get/create/set_status работают против API (unit с mock).
5. Docs MCP описывают поток Variant C и границу TZD-22 vs TZD-23.
6. Gates:

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- import-task
cd desktop/mcp && pnpm test
```

(точную test-команду desktop сверить с `desktop/package.json` / mcp package — использовать существующий test runner).

7. Checklist + Executor report (auto) перед archive.
8. Cursor/PO PASS если TZ помечен review — иначе PO «ок» на smoke.

---

## known_limitation → successors

| ID | Что |
|----|-----|
| **TZD-23** | AI matching + `aiReport` + HITL план в чате + propose create/update по плану + status `analyzing`→`awaiting_user`→`applying`→`done` |
| later | Web UI «Задачи импорта» в ERP; blob/file upload на сервер; >500 rows (TZD-18 chunk) |
| — | In-app AI chat Desktop (отдельный stream) |

---

## Handoff (копипаст исполнителю)

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZD-22.md + checklist docs/agent-checklists/TZD-22.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/_backlog/desktop/TZD-22-ai-import-task.md и выполни TZD-22.
Не делай matching/чат (TZD-23). Propose path не ломай.
Archive только после Cursor/PO PASS если TZ требует review.
```

ARCHIVE: `tasks/_archive/2026-08/TZD-22.done.md` + progress + lock `.mimocode/locks/TZD-22-ai-import-task.lock` по GEMINI.md / executor skill.
