═══════════════════════════════════════════════════════════════
TZD-18: MCP batch propose/confirm + scaled ImportTask
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-DESKTOP-BULK-IMPORT.md (#3)
DEPENDS ON: TZD-23 DONE (HITL path); TZD-17 DONE
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-18.md
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Backend mutation-journal (+ import-task cap) + Desktop/MCP.

CONFLICT KEYS:
backend/src/modules/mutation-journal/**;
backend/src/modules/import-task/**;
desktop/mcp/src/write-tools.ts;
desktop/mcp/src/inbox-tools.ts;
desktop/mcp/src/import-task-tools.ts;
desktop/docs/MCP.md;

Проверено: per-row propose round-trips; ImportTask create cap ~500;
write-tools propose_material_*; TZD-23 apply_plan loops rows.

---

## ИСХОДНОЕ

Большой Excel = N HTTP proposes → медленно / легко partial. Cap 500 режет опт.

---

## ЧТО ДЕЛАТЬ

### 1. Journal batch API

- `POST /api/mutation-journal/propose-batch`  
  `{ items: CreateProposalDto[], idempotencyKey? }` → `{ proposalIds, errors[] }`  
  Атомарность best-effort: либо все propose OK, либо rollback созданных
  (или all-or-nothing transaction если mongoose позволяет; иначе документировать
  partial + cancel_batch).
- `POST /api/mutation-journal/confirm-batch` `{ ids: string[] }`
- `POST /api/mutation-journal/cancel-batch` `{ ids: string[] }`

### 2. MCP

- `kppdf_propose_material_batch`, `kppdf_confirm_batch`, `kppdf_cancel_batch`
- `kppdf_import_task_apply_plan`: использовать batch внутри (chunk size 50–100)
- inbox_propose_file: опц. limit/offset (не ломать validate mode)

### 3. ImportTask cap

- Поднять create limit до **2000** (или 5000 если тесты ок); выше → 400 с clear error.
- Документировать в MCP.md.

### 4. НЕ

BOM (19); product kinds (27) — batch только material.* в этом TZ
(после 27 — тот же batch API должен принять новые kinds без redesign).
Silent SoT.

---

## AC

1. propose-batch 50 items → 50 ids, 0 SoT writes until confirm-batch.  
2. confirm-batch создаёт materials; cancel-batch не пишет SoT.  
3. apply_plan на 120-row plan использует ≤3 batch calls (chunk).  
4. create ImportTask 600 rows → success (если cap≥600).  
5. Gates: journal tests + import-task + mcp test + tsc.

known_limitation: 10k rows = несколько ImportTask chunks если >cap; PDF нет.
