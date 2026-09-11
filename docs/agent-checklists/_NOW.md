# NOW

updated_at: 2026-09-11T08:10:00Z

## ACTIVE / LIVE

- **Freebuff:** PARK
- **Claude:** IN PROGRESS — `tasks/PROMPT-CLAUDE-TEXT-LIBRARY-HIERARCHY.md` — 01/3 DONE (BE parentId), continuing 02/3 (NX CRUD).
- **Deploy stamp:** READY

## NEXT

Claude continuous: text library hierarchy — 02 NX CRUD categories, 03 picker/form cascade.

## DONE

- Text library hierarchy 01/3 (`TZ-NX-TEXT-CAT-PARENT`): `TextBlockCategory.parentId` (depth≤1); `TextBlockService.create()` now requires an explicit leaf `categoryId` (no more silent «Общее» fallback) — PO: subcategory mandatory; `update()` gained `categoryId` re-filing (was silently ignored before); `remove()` blocks deleting a root with subcategories; `findAll` gained `parentId`/`rootsOnly`
- Studio console hygiene 04/4 (`TZ-NX-NO-NATIVE-CONFIRM`) — `72688319`
- Studio console hygiene 01–03 — `96757c61` / `62d31f2c` / `7e4f9154`
- HUB / SHELL-HUB-POLISH earlier

## PARK

- Deploy · G12 · desk · wipe · `/production` SKIP · Documents later · live TextBlock BlockSource
