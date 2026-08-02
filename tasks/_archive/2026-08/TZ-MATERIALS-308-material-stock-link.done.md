═══════════════════════════════════════════════════════════════
TZ-MATERIALS-308: Материалы — доменная связка материал → склад
═══════════════════════════════════════════════════════════════

(Original TZ moved from backlog — implementation already in tree.)

ARCHIVE_MARKER
outcome: DONE
date: 2026-08-02
closeout: Cursor backlog audit (code already shipped)
evidence:
  - StorageItem.materialId + XOR with productId (schema/service/DTO)
  - POST /materials/:materialId/storage-items ; GET ?materialId=
  - FE storage-items filter + materials «Склад →» link
  - docs/agent-checklists/TZ-MATERIALS-308.md (AC mostly checked)
  - PAGE-TZ-INDEX marks MATERIALS-308 DONE
notes: Backlog copy was STALE («productId only»). Do not re-implement.
lock_file_skipped: TRUE
