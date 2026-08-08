═══════════════════════════════════════════════════════════════
TZD-23: AI Import Task — matching + HITL plan → propose
═══════════════════════════════════════════════════════════════

STATUS: PARK · READY to unpark on PO «делай TZD-23»
DEPENDS ON: TZD-22 DONE
LAYER: 2 (BE import-task + MCP tools; no FE Angular)
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md
CHECKLIST: docs/agent-checklists/TZD-23.md (создать при claim)

РОЛЬ АГЕНТА: Backend + Desktop/MCP executor. Cursor Mode A не пишет product TS.
ЗАВИСИМОСТИ: TZD-22 archive PASS; journal material.create/update работают.
PAGES: (desktop companion — не Angular) · PAGE_DOCS: n/a

CONFLICT KEYS:
backend/src/modules/import-task/**;
desktop/mcp/src/import-task-tools.ts;
desktop/mcp/src/import-task-tools.test.ts;
desktop/mcp/src/write-tools.ts;
desktop/mcp/src/tools.ts;
desktop/docs/MCP.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md;

Проверено:
- backend/src/modules/import-task/import-task.schema.ts (aiReport, proposalIds reserved);
- import-task.service.ts patchStatus — сейчас только status/errorMessage;
- mutation-journal MUTATION_KINDS = material.create | material.update;
- desktop/mcp import-task-tools: list/get/create/set_status;
- PO-DIARY 2026-08-08 Variant C; desktop/docs/MCP.md Variant C.

Loose wording: «proposal» в journal ≠ коммерческое КП (`/proposals`).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. ImportTask создаётся в `ready_for_ai` с `rows[]`, `aiReport=null`, `proposalIds=[]`.
2. MCP умеет list/get/create/set_status. **Нет** API записать план matching / proposalIds.
3. Expert Desktop «Предложить строки» и `kppdf_inbox_propose_file` могут создать N unmatched `material.create` — это **не** путь TZD-23.
4. Статусы уже в схеме: analyzing | awaiting_user | applying | done | failed | cancelled.
5. Cap create ≈ 500 rows (TZD-18 later).

---

## ЧТО ДЕЛАТЬ

### 1. Backend: patch report + proposalIds

- Расширить DTO/PATCH (новый endpoint **или** расширить существующий patch):
  - `PATCH /api/import-tasks/:id/report` (предпочтительно отдельный)  
    body: `{ summary?: string, aiReport: object, status: 'analyzing'|'awaiting_user' }`
  - `PATCH /api/import-tasks/:id/proposals`  
    body: `{ proposalIds: string[], status?: 'applying'|'done'|'failed' }`
- Либо один `PATCH /api/import-tasks/:id` с whitelist fields: status, summary, aiReport, proposalIds, errorMessage — **без** мутации rows/source.
- Валидация переходов как сейчас + запись aiReport **только** из non-terminal.
- `aiReport` минимальная форма (зафиксировать в schema comment + MCP.md):

```ts
{
  version: 1,
  matchedAt: string, // ISO
  counts: { new: number, skip: number, update: number, doubt: number },
  rows: Array<{
    rowIndex: number,
    decision: 'new' | 'skip' | 'update' | 'doubt',
    materialId?: string,       // для update/skip
    reason?: string,
    proposed?: { name?: string, unit?: string, article?: string, sku?: string, notes?: string }
  }>
}
```

- Unit tests: set report → awaiting_user; reject patch rows; transition applying with proposalIds.

### 2. MCP tools

Добавить (имена фиксированы):

| Tool | Поведение |
|------|-----------|
| `kppdf_import_task_set_report` | Пишет aiReport+summary, status analyzing→awaiting_user (или сразу awaiting_user). **0** journal writes. |
| `kppdf_import_task_apply_plan` | **Только если** status=`awaiting_user` и input `userOk: true`. По `aiReport.rows`: для `new` → propose_material_create; для `update` → propose_material_update; `skip`/`doubt` — не propose. Записать proposalIds, status=`applying`. Вернуть ids + counts. |
| (опц. тонко) document в MCP.md chat protocol HITL | Агент **не** вызывает apply_plan без явного ok пользователя в чате. |

Обновить `kppdf_import_task_set_status` docs: не использовать для записи aiReport.

Тесты: mock backend; apply_plan без userOk → fail; apply_plan с doubt-only → 0 proposes.

### 3. Agent playbook в `desktop/docs/MCP.md`

Секция **Variant C / TZD-23 protocol** (коротко, копируемо):

1. `import_task_get`
2. status → `analyzing`
3. Для каждой строки: `list_materials` / validate / (best-effort name|article|sku match) → decision
4. `set_report` → `awaiting_user`
5. В чат человеку: «N new / M skip / K update / D doubt» + сомнения списком
6. Ждать ok / правки (правки = новый set_report) / cancel
7. `apply_plan` userOk=true → propose*
8. Пользователь confirm в Desktop/MCP → status `done` (агент или UI выставляет done когда все proposal confirmed/cancelled — минимально: агент ставит done после apply если PO confirm отдельно; **AC:** после apply status=`applying`, proposalIds.length>0 для new+update; done — отдельным set_status когда journal confirmed **или** документ «менеджер confirms в Desktop → агент set_status done»)

Упрощение для AC (выбрать и зафиксировать в коде/docs):
- **A (предпочтительно):** apply_plan → applying; Desktop/MCP confirm loop; агент `set_status done` когда все proposalIds в terminal journal state (если есть read tool list_proposals — использовать; иначе known_limitation: done вручную/set_status после confirm UI).
- Не silent SoT.

### 4. Docs / feature checklist

- MCP.md: TZD-23 DONE follow-up; предупреждение: expert propose ≠ AI path.
- FEATURE-INTEGRATION-CHECKLIST §E: пункт TZD-23.
- Park README: TZD-23 → Done после archive.

### 5. НЕ делать в этом TZ

- Column reshape (→ TZD-26)
- Batch 1k (→ TZD-18)
- product.* journal (→ TZD-27)
- Doc templates / manager todos (→ TZD-28/29)
- Web UI очереди ImportTask
- Ломать expert propose (можно добавить warning copy в Desktop — опционально 1 строка)

---

## ИЗМЕНЯТЬ

- `backend/src/modules/import-task/**` (+ specs)
- `desktop/mcp/src/import-task-tools.ts` (+ test), `tools.ts` register
- `desktop/docs/MCP.md`
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` (галочка)
- checklist + archive closeout

## НЕ ИЗМЕНЯТЬ

- Angular frontend
- mutation-journal kinds (остаются material.*)
- desktop/src/core/pipeline.ts (in-app AI)
- TZD-18/19/26+ файлы кроме ссылок
- Silent MaterialService.create из MCP

---

## КРИТЕРИИ ПРИЁМКИ

1. PATCH (report) сохраняет `aiReport` + `summary`, status `awaiting_user`; rows/source не меняются.
2. MCP `kppdf_import_task_set_report` отражается в `import_task_get`.
3. `kppdf_import_task_apply_plan` без `userOk: true` → error, 0 proposes.
4. С фикстурой aiReport (2 new, 1 skip, 1 update, 1 doubt): apply → ровно 3 proposes (2 create + 1 update), proposalIds.length=3, status=applying.
5. До apply journal не содержит proposes от этого task path.
6. MCP.md содержит Variant C protocol TZD-23.
7. Gates:

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- import-task
cd desktop/mcp && pnpm test
cd desktop/mcp && pnpm exec tsc --noEmit
```

8. Archive + lock + progress + park README update; verify-status / project closeout per GEMINI.md.

known_limitation:
- Matching quality = best-effort name/article/sku; нет ML embedding.
- done-after-confirm может быть manual set_status если нет journal poll tool — зафиксировать в MCP.md.
- Multi-entity / reshape / batch — successors.

---

## Промпт исполнителю

```
Прочитай GEMINI.md + tasks/_park/desktop/TZD-23-ai-import-matching-hitl.md
+ docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md §P0.
Claim TZD-23. Сделай report API + MCP set_report/apply_plan + MCP.md protocol.
Не трогай Angular. Gates + archive.
```
