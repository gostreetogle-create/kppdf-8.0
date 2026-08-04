═══════════════════════════════════════════════════════════════
TZ-MATERIALS-311: Один тип габарита на материал — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (executor batch, PO small-tech)
acceptance_status: PASS
verification:
  - frontend jest material-form-dialog.component.spec.ts: 33/33 PASS
  - backend jest material.service.spec.ts: 20/20 PASS (incl. duplicate-type 400)
  - frontend tsc -p tsconfig.app.json --noEmit: PASS
protected_files:
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/shared/ui/button/button.component.ts
  - backend/src/modules/material/material.service.ts
  - backend/src/modules/material/material.service.spec.ts
checklist: docs/agent-checklists/TZ-MATERIALS-311.md
lock: .mimocode/locks/TZ-MATERIALS-311-unique-dimension-types.lock

---

## Summary

- UI: один type (Длина/Ширина/Высота/Толщина/Ø/Глубина) на материал; «+» disabled
  когда все заняты; select не предлагает занятые; legacy дубли срезаются на edit/save.
- API: create/update → BadRequestException при дубле type.
- pi-button: восстановлен stopPropagation (регрессия double-add).

known_limitation: уже сохранённые дубли в Mongo не мигрируются автоматически —
открой карточку и сохрани (dedupe при patch/payload).
