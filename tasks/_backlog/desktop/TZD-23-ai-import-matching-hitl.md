═══════════════════════════════════════════════════════════════
TZD-23: AI Import Task — matching + HITL plan → propose
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#1)
DEPENDS ON: TZD-22 DONE
LAYER: 2
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md
CHECKLIST: docs/agent-checklists/TZD-23.md

РОЛЬ АГЕНТА: Backend + Desktop/MCP executor.
ЗАВИСИМОСТИ: TZD-22 archive PASS; journal material.create/update.
PAGES: n/a (desktop companion)

CONFLICT KEYS:
backend/src/modules/import-task/**;
desktop/mcp/src/import-task-tools.ts;
desktop/mcp/src/import-task-tools.test.ts;
desktop/mcp/src/write-tools.ts;
desktop/mcp/src/tools.ts;
desktop/docs/MCP.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md;

Проверено:
- import-task.schema.ts (aiReport, proposalIds reserved);
- import-task.service.ts patchStatus — только status/errorMessage;
- MUTATION_KINDS = material.create | material.update;
- MCP import_task: list/get/create/set_status;
- Variant C в MCP.md / PO-DIARY.

Loose: journal «proposal» ≠ коммерческое КП (`/proposals`).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. ImportTask → `ready_for_ai`, `aiReport=null`, `proposalIds=[]`.
2. Нет API записать план matching / proposalIds.
3. Expert propose / inbox_propose_file ≠ путь TZD-23.
4. Статусы: analyzing | awaiting_user | applying | done | failed | cancelled.
5. Cap create ≈ 500 (TZD-18 later).

---

## ЧТО ДЕЛАТЬ

### 1. Backend: report + proposals patch

Предпочтительно:
- `PATCH /api/import-tasks/:id/report`  
  `{ summary?, aiReport, status: 'analyzing'|'awaiting_user' }`
- `PATCH /api/import-tasks/:id/proposals`  
  `{ proposalIds: string[], status?: 'applying'|'done'|'failed' }`

Или один PATCH whitelist: status, summary, aiReport, proposalIds, errorMessage — **без** rows/source.

`aiReport` форма:

```ts
{
  version: 1,
  matchedAt: string,
  counts: { new: number, skip: number, update: number, doubt: number },
  rows: Array<{
    rowIndex: number,
    decision: 'new' | 'skip' | 'update' | 'doubt',
    materialId?: string,
    reason?: string,
    proposed?: { name?: string, unit?: string, article?: string, sku?: string, notes?: string }
  }>
}
```

Tests: report → awaiting_user; reject rows patch; applying + proposalIds.

### 2. MCP tools

| Tool | Поведение |
|------|-----------|
| `kppdf_import_task_set_report` | aiReport+summary → awaiting_user; **0** journal |
| `kppdf_import_task_apply_plan` | Только `status=awaiting_user` и `userOk:true`. new→propose_create; update→propose_update; skip/doubt — нет. proposalIds + status=applying |

Tests: без userOk → fail; doubt-only → 0 proposes.

### 3. MCP.md Variant C protocol

1. get → analyzing → match rows → set_report → awaiting_user  
2. Чат: «N new / M skip / K update / D doubt»  
3. Ждать ok → apply_plan → confirm в Desktop → set_status done  
Зафиксировать: apply без ok запрещён.

### 4. Docs

FEATURE checklist §E TZD-23; backlog/park sync after archive.

### 5. НЕ

reshape (26); batch (18); product.* (27); docs/todos (28/29); Angular; silent SoT.

---

## ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ

ИЗМЕНЯТЬ: import-task/**; mcp import-task-tools (+test), tools.ts; MCP.md; FEATURE checklist.  
НЕ: Angular; journal kinds; pipeline.ts; silent MaterialService.create.

## КРИТЕРИИ ПРИЁМКИ

1. Report PATCH → aiReport + awaiting_user; rows/source intact.  
2. set_report видно в get.  
3. apply_plan без userOk → error, 0 proposes.  
4. Fixture 2 new + 1 skip + 1 update + 1 doubt → 3 proposes, applying.  
5. MCP.md protocol TZD-23.  
6. Gates:

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- import-task
cd desktop/mcp && pnpm test
cd desktop/mcp && pnpm exec tsc --noEmit
```

7. Archive + lock + progress + commit/push; Executor report в checklist.

known_limitation: matching best-effort name/article/sku; reshape/batch/products — следующие TZ волны.
