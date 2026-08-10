═══════════════════════════════════════════════════════════════
TZ-UX-FORM-307: Form Wave B batch 1 — contracts / orgs / work-types
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #7 (last)
DEPENDS ON: TZ-UX-FORM-305 DONE (Wave A canon)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-UX-FORM-307.md
AUDIT: docs/audits/2026-08-08-dialog-layout-canon.md · docs/pages/ui-form-sections-canon.md

РОЛЬ: Frontend only

CONFLICT KEYS:
frontend/src/app/pages/contracts/contract-form-dialog.component.ts;
frontend/src/app/pages/organizations/organization-form-dialog.component.ts;
frontend/src/app/pages/work-types/work-type-form-dialog.component.ts;
docs/agent-checklists/TZ-UX-FORM-307.md;

Эталон секций: материал — Основные / Дополнительно / Габариты (где применимо).

---

## ИСХОДНОЕ

Wave B leftover: contracts / organizations / work types без единого section wrap.

## ЧТО ДЕЛАТЬ

1. Три диалога → Pi form sections как материал (shared примитив, не копипаста CSS).  
2. Dialog size S/M/L канон; ёмкость полей где цифры.  
3. Не менять submit DTO / control names / business logic.  
4. Не трогать admin user/role (→ FORM-308 later); не proposal-form (рядом SALES).

## НЕ

desktop; QuickCreate; product/module/material dialogs (уже Wave A); deploy.

## AC

1. Три диалога визуально с секциями как материал.  
2. Submit payloads unchanged (smoke create/edit).  
3. FE tsc PASS.  
4. Checkpoint: WAVE-SHOP-NORTH-B DONE → idle; деплой не предлагать автоматом.
