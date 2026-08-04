═══════════════════════════════════════════════════════════════
TZ-DICT-308: Group Chip Workspace — shell + nav groups
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: DICT Wave 1 (302–307) DONE; design APPROVED
LAYER: 3

SoT: docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md
Канон: docs/PO-DIARY.md §5 (2026-08-04 Group Chip Workspace)

CONFLICT KEYS:
  frontend/src/app/shared/page/pi-group-workspace.* (NEW) ;
  frontend/src/app/layout/app-layout.component.ts ;
  frontend/src/app/app.routes.ts ;
  frontend/src/app/pages/dictionaries/* (group routes / thin wrappers) ;
  docs/pages/dictionaries*.md ;
  docs/agent-checklists/TZ-DICT-308.md

ЧТО ДЕЛАТЬ:
1. Shared PiGroupWorkspace (или эквивалент): сверху только chips группы;
   активный — жёлтый (тема); wrap на 2 ряда; sticky под app header;
   сразу под chips — [tools] + body (таблица). БЕЗ огромного H1, БЕЗ path
   «Справочники › …».
2. Nav «Справочники»: dropdown по группам (Классификация / Измерения /
   Оформление / Документы). Клик группы → экран группы.
3. Пилот: группа «Измерения» с chip «Единицы» (существующий UnitsPage body).
4. Specs shell + nav smoke; fe tsc + jest PASS.
5. Docs + READY FOR REVIEW в DICT-WAVE1-REVIEW.md.

AC: соответствует §2 design SoT; default = первый chip; Cursor PASS.

НЕ: table kit unification (отдельный TZ); backend; CATALOG; commit/push;
  archive до Cursor PASS; другие группы можно stub/redirect в 309–310.

∥: после CATALOG-305 DONE — OK один FE агент.
