# WAVE-NX-GANTT-REGISTRIES — справочники цеха в NX-реестрах

**Цель:** всё, без чего Гант не настраивается с NX, — в `/registries` с полным CRUD (как materials/modules).  
**Audit:** `docs/audits/2026-09-05-gantt-registries-data-audit.md`  
**Агент:** Freebuff continuous (один слот `kppdf-web`)  
**Промпт:** `tasks/PROMPT-FREEBUFF-NX-GANTT-REGISTRIES.md`

| Order | SIZE | TZ | Path | Status |
|-------|------|-----|------|--------|
| R1 | L | Виды работ | `tasks/_archive/2026-09/TZ-NX-REGISTRIES-WORK-TYPES.done.md` | DONE |
| R2 | L | Люди / workers | `tasks/_archive/2026-09/TZ-NX-REGISTRIES-WORKERS.done.md` | DONE |
| R3 | L | Module.workTypes в диалоге | `tasks/_archive/2026-09/TZ-NX-REGISTRIES-MODULE-WORK-TYPES.done.md` | DONE |

**Правила:** claim → gates incl. `nx build kppdf-web` → archive → next. Не параллелить с другим TZ на `kppdf-web/src`.

### R3 evidence

Module create/edit now persists separate `workTypes[]` planning links (`workTypeId`, `estimatedHours`, `sortOrder`) while material composition remains in the composition panel. Direct Jest: 8/8; app typecheck and changed-file lint: PASS; final NX build: PASS.  
**Не в этой волне:** G14 assign; counterparties registry; legacy delete.

### Report → next

После R3 closeout → Cursor: G13 close/supersede + при свободном BE слоте Claude `PROMPT-CLAUDE-GANTT-ASSIGN` (G14).
