═══════════════════════════════════════════════════════════════
TZ-CATALOG-301: Material — materialKind, assortment, standardRef,
                 materialGrade, weightKg + migration — DONE
═══════════════════════════════════════════════════════════════

> Исходная спека: см. тело ниже (архив). Канон: `tasks/TZ-CATALOG-300.md`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (architect review) + backend executor
acceptance_status: PASS
verification:
  - backend tsc --noEmit: PASS
  - targeted Jest 23/23 PASS
  - materials e2e 6/6 PASS (after docker start kppdf-mongo)
  - Architect verdict: PASS (scope clean; no Product/FE composition)
protected_files:
  - backend/src/modules/material/material.schema.ts
  - backend/src/modules/material/dto/create-material.dto.ts
  - backend/src/modules/material/material.service.ts
  - backend/src/modules/material/material.controller.ts
  - backend/src/database/migrations/2026-08-04-TZ-CATALOG-301-material-fields.ts
  - backend/test/e2e/materials.e2e-spec.ts
checklist: docs/agent-checklists/TZ-CATALOG-301.md
successor: TZ-CATALOG-302 (composition) — start on PO signal / sequential wave

---

(См. git history / checklist для полного текста шагов; executable AC выполнены.)
