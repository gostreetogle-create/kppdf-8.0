═══════════════════════════════════════════════════════════════
TZD-13: MCP write tools + propose/confirm + mutation journal
═══════════════════════════════════════════════════════════════

> PARKED. After TZD-11 (+ preferably TZD-12). LAYER 2–3.
> CONFLICT: `desktop/mcp/**`; `backend/src/modules/mutation-journal/**` (new) OR `desktop-agent/**`.
> Vision §4 — ring buffer undo, not full DB backup.

РОЛЬ АГЕНТА: executor (backend journal + MCP write protocol).

ЗАВИСИМОСТИ: TZD-11; pairing JWT with write roles (manager/admin as today).

Проверено: vision §4; existing AuditAction decorator; soft-delete patterns on warehouse/storage.

---

## Domain preflight

- SoT = existing entity APIs (Material, StorageItem, Warehouse, …).
- **Propose/confirm**: tool `kppdf_propose_*` returns `proposalId` + diff; `kppdf_confirm_proposal` applies; `kppdf_undo_mutation` reverts if in ring.
- Journal: last **N=50** batches (config); store before/after per entity touch — **not** mongodump.

---

## ЧТО ДЕЛАТЬ

1. Backend: `MutationJournal` collection + service:
   - create batch, list recent, get by id, undo (re-apply before / undelete).
   - RBAC: same user or admin; org-scoped.
2. MCP write protocol:
   - propose create/update material (start with **one** entity — Material).
   - confirm → call existing POST/PATCH + journal entry.
   - undo last / by id within ring.
3. Destructive multi-delete: propose-only; never silent.
4. Tests: propose→confirm creates row visible via GET; undo restores; ring evicts oldest.
5. Docs: safety section in `desktop/docs/MCP.md`.

---

## НЕ

- Full database backup per op.
- Bypass soft-delete.
- Write Orders/Production/Gantt in this TZ.
- Auto-confirm mode in production defaults (dev flag only if needed).

---

## ACCEPTANCE

- [ ] Propose/confirm/undo path works for Material create or update.
- [ ] Journal ring size enforced.
- [ ] Unconfirmed propose does not mutate SoT.
- [ ] Backend tsc + focused jest PASS; MCP docs updated.

CONFLICT KEYS: `backend/src/modules/mutation-journal/;desktop/mcp/;desktop/docs/MCP.md`
