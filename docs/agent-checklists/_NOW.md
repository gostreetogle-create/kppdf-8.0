# NOW

updated_at: 2026-09-11T08:55:00Z

## ACTIVE / LIVE

- **Freebuff:** PARK
- **Claude:** IDLE — `WAVE-NX-TEXT-LIBRARY-HIERARCHY` 01/02/03 ALL DONE, `_active` пуст. Заметил в очереди новый непрочитанный `tasks/PROMPT-CLAUDE-WAREHOUSE-INVENTORY-IMPORT.md` (+ `TZ-NX-WH-INV-*`, `TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK.md`) — не в текущем PROMPT, не трогал.
- **Deploy stamp:** READY

## NEXT

Свободный слот. Кандидат в очереди: `PROMPT-CLAUDE-WAREHOUSE-INVENTORY-IMPORT` (ждёт claim).

## DONE

- Text library hierarchy WAVE COMPLETE (`WAVE-NX-TEXT-LIBRARY-HIERARCHY`, 2026-09-11): 01 BE parentId+leaf-only, 02 NX CRUD categories, 03 picker/form cascade + registry category name. Audit closeout: `docs/audits/2026-09-11-text-library-category-subcategory-audit.md` §6
- Text library hierarchy 02/3 (`TZ-NX-TEXT-CAT-NX-CRUD`): `/dictionaries/text-block-categories` dead nav fixed — new NX master-detail page (roots → subcategories), create/edit/delete dialogs, `PiTextBlockCategoriesService` gained create/update/remove. Collateral: bumped two hardcoded header-chip-count assertions in `app-shell.component.spec.ts` (the `reference` nav group's chip was hidden while 100% dead; now has its first live route)
- Text library hierarchy 01/3 (`TZ-NX-TEXT-CAT-PARENT`): `TextBlockCategory.parentId` (depth≤1); `TextBlockService.create()` now requires an explicit leaf `categoryId` (no more silent «Общее» fallback) — PO: subcategory mandatory; `update()` gained `categoryId` re-filing (was silently ignored before); `remove()` blocks deleting a root with subcategories; `findAll` gained `parentId`/`rootsOnly`
- Studio console hygiene 04/4 (`TZ-NX-NO-NATIVE-CONFIRM`) — `72688319`
- Studio console hygiene 01–03 — `96757c61` / `62d31f2c` / `7e4f9154`
- HUB / SHELL-HUB-POLISH earlier

## PARK

- Deploy · G12 · desk · wipe · `/production` SKIP · Documents later · live TextBlock BlockSource
