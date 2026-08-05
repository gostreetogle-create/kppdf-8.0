# DICT Wave 1 — review inbox

> Как CATALOG-WAVE1-REVIEW.md. Исполнитель пишет READY FOR REVIEW; Cursor — Verdict PASS/FAIL.

## Inbox

## TZ-DICT-312 — DONE

date: 2026-08-05
workspace: D:\\kppdf-8.0
executor: openai/gpt-5.6-luna (Buffy) + Cursor Architect PASS
archive: tasks/_archive/2026-08/TZ-DICT-312.done.md
checklist: docs/agent-checklists/TZ-DICT-312.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest combined review batch: 119/119 PASS
conflict_disclosure: pi-group-workspace sticky stack; app-layout denseMain dictionary routes
note: denseMain + top-0 chips/tools; CTA min-width:0. Browser smoke optional for PO.
next: DONE

### Verdict TZ-DICT-312
status: PASS
notes: Adaptive sticky stack + dense dictionary routes address gap; hard-code 6.25rem gone; CTA protection present. tsc+jest verified.
required_fixes: none

## TZ-UI-TABLE-302 — DONE

date: 2026-08-05
workspace: D:\\kppdf-8.0
executor: openai/gpt-5.6-luna (Buffy) + Cursor Architect PASS
archive: tasks/_archive/2026-08/TZ-UI-TABLE-302.done.md
checklist: docs/agent-checklists/TZ-UI-TABLE-302.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest pi-table-tree + categories + related: in 119/119 PASS
note: PiTableTree 2-level MVP; dragReorder flag; CategoriesPage migrated
next: DONE — UI-TABLE-305 remains backlog

### Verdict TZ-UI-TABLE-302
status: PASS
notes: Shared tree kit + categories migrate; drag capability preserved; gates green. Known: 2-level MVP + filtered-drag index limit documented.
required_fixes: none

## TZ-DICT-311 — DONE

date: 2026-08-05
archive: tasks/_archive/2026-08/TZ-DICT-311.done.md
note: hub → measurements; DictionariesHubPage deleted
### Verdict TZ-DICT-311
status: PASS
required_fixes: none

## TZ-DICT-310 — DONE

date: 2026-08-05
archive: tasks/_archive/2026-08/TZ-DICT-310.done.md
gates: fe tsc PASS; jest 105/105
note: slim — leaf pages host PiGroupWorkspace chips; group aliases; nav 4 groups
### Verdict TZ-DICT-310
status: PASS
notes: Documents 2 chips; classification/appearance 1 chip each.
required_fixes: none

## TZ-DICT-309 — DONE

date: 2026-08-05
workspace: D:\kppdf-8.0
executor: Cursor Architect (deploy-day)
archive: tasks/_archive/2026-08/TZ-DICT-309.done.md
gates:
  - fe tsc: PASS
  - jest routes+dictionaries+measurements: 93/93 PASS
note: units redirect; UnitsPage deleted; canonical = measurements group
next: DONE — 310/311 tomorrow

### Verdict TZ-DICT-309
status: PASS
notes: NG04014 fixed (no canMatch on redirect); hub card points to measurements.
required_fixes: none

## TZ-DICT-308 — DONE

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: Buffy + Cursor Architect PASS
archive: tasks/_archive/2026-08/TZ-DICT-308.done.md
checklist: docs/agent-checklists/TZ-DICT-308.md
gates:
  - fe tsc: PASS (Cursor re-run, exit 0)
  - jest dictionaries + pi-dictionary-shell + measurements-group: 83/83 PASS (10 suites)
  - code review: PASS (shell + nav + pilot)
conflict_disclosure: PiGroupWorkspace NEW; MeasurementsGroupPage NEW; app.routes + app-layout Справочники; shared/page/index export
note: Пилот Group Chip Workspace — Измерения/Единицы. Chips жёлтый (sunrise-warm), sticky, без H1/path. Nav по группам. Тираж → DICT-309…311.
next: DONE — archived after Cursor PASS

### Verdict TZ-DICT-308
status: PASS
notes: SoT §2 соблюдён на пилоте; fe tsc + 83/83 verified; inactive chip hairline optional polish; Documents still exposes leaf «Категории текстов» (P1 restore) — подчистить в DICT-310; UnitsPage duplication + hard-coded tools `top` — known limits OK for pilot.
required_fixes: none (docs closeout by Cursor)

## TZ-DICT-304 — DONE

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: buffy (code) + Cursor closeout
archive: tasks/_archive/2026-08/TZ-DICT-304.done.md
checklist: docs/agent-checklists/TZ-DICT-304.md
gates:
  - fe tsc: PASS (Cursor)
  - jest units.page.spec: 2/2 PASS (Cursor)
component: UnitsPage on /dictionaries/units
api:
  - PiDictionaryShell title «Единицы измерения» + totalLabel
  - sticky tools: search + category filter + inline add (formControlName) + CTA
  - dead dictionaries.page.ts deleted; hub docs = DictionariesHubPage
conflict_disclosure: units.page.ts/.spec.ts, docs units + dictionaries hub, checklist
note: Freebuff crash left empty handoff; Cursor fixed form bindings + specs + archive
next: DONE — DICT Wave 1 cutovers complete

### Verdict TZ-DICT-304
status: PASS
notes: Shell D1–D2 complete; dead page gone; form bindings fixed; docs+specs green.
required_fixes: none

---

## TZ-DICT-307 — DONE

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: buffy
archive: tasks/_archive/2026-08/TZ-DICT-307.done.md
checklist: docs/agent-checklists/TZ-DICT-307.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest doc-template + text-block cats: 26/26 PASS (Cursor)
  - executor dictionaries: 72/72
component:
  - frontend/src/app/pages/dictionaries/document-template-categories.page.ts
  - frontend/src/app/pages/dictionaries/text-block-categories.page.ts
api:
  - PiDictionaryShell: title «Категории шаблонов» / «Категории текстов» + totalLabel
  - [tools]: search + CTA; no page-header/section/toolbar prose
behavior:
  - CRUD/system-guard preserved; genitive «X из Y категорий» fixed
conflict_disclosure: only conflict keys; routes/pageKeys untouched
note: role=toolbar nit is shell (302) — out of scope
next: DONE — archived after Cursor PASS

### Verdict TZ-DICT-307
status: PASS
notes: Both pages on PiDictionaryShell; sticky search+CTA; prose chrome gone (asserted in specs); tsc + 26/26 verified. pageKeys intact.
required_fixes: none

---

## TZ-DICT-305 — DONE

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: buffy
archive: tasks/_archive/2026-08/TZ-DICT-305.done.md
checklist: docs/agent-checklists/TZ-DICT-305.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest categories + shell: 11/11 PASS (Cursor)
  - executor full frontend: 1032/1032
component: frontend/src/app/pages/dictionaries/categories.page.ts
api:
  - PiDictionaryShell: title «Категории» + totalLabel (compact count)
  - [tools] slot: search + select «Тип» (all/material/product/general) + CTA «+ Создать»
  - no pi-page-header / pi-section / pi-toolbar; no eyebrow/description chrome
behavior:
  - CDK drag-reorder сохранён: root + nested child, optimistic update
  - client-side type filter; auto-expand родителей при поиске/фильтре
conflict_disclosure:
  - categories.page.ts · categories.page.spec.ts · docs/pages/categories.page.md · checklist
note: CATALOG-304 backend/worktree changes untouched. team_room claim n/a for _active (room indexes root tasks only). known_limit: drag-while-filtered — cdkDropListData is filtered treeData() but reorder operates on allTreeData() (pre-existing, was already the case with search; not fixed in this TZ)
next: DONE — archived after Cursor PASS

### Verdict TZ-DICT-305
status: PASS
notes: Shell D1–D2 + sticky tools (search/type/CTA); CDK drag intact; type filter + specs verified (tsc + 5/5 categories + 6/6 shell). Known limit drag-while-filtered documented — non-blocking.
required_fixes: none

---

## TZ-DICT-302 — READY FOR REVIEW

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: buffy
archive: tasks/_archive/2026-08/TZ-DICT-302.done.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest pi-dictionary-shell: 6/6 PASS (Cursor re-run)
  - git diff --check: PASS
component: PiDictionaryShellComponent (shared/page)
api:
  - title (required string) — compact H1, no eyebrow
  - totalLabel (optional string) — muted count
  - [tools] slot — sticky bar (top-14, z-20, bg-paper, hairline-b)
  - default slot — table/tree content
  - NO eyebrow/description API (per D1 canon)
conflict_disclosure:
  - frontend/src/app/shared/page/pi-dictionary-shell.component.ts (new)
  - frontend/src/app/shared/page/pi-dictionary-shell.component.spec.ts (new)
  - frontend/src/app/shared/page/index.ts
note: no page migration; stable API for DICT-303…307
next: DONE — next = TZ-DICT-303 (hub + nav)

### Verdict TZ-DICT-302
status: PASS
notes: Shell matches D1–D2; tsc+6/6 verified. Nit (non-blocking): `.dictionary-header` may need `flex items-baseline` so totalLabel sits on one line with title — fix in 303/304 cutover if needed.
required_fixes: none

---

## TZ-DICT-303 — DONE

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: buffy
archive: tasks/_archive/2026-08/TZ-DICT-303.done.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest dictionaries: 65/65 PASS (Cursor re-run, 7 suites)
  - git diff --check: PASS
routes:
  - /dictionaries → DictionariesHubPage (cards)
  - /dictionaries/units → UnitsPage (pageKey: dictionaries)
nav:
  - Обзор / Классификация / Измерения / Оформление / Документы + separatorLabel
rbac: pageKeys preserved; /units shares pageKey dictionaries
conflict_disclosure: hub + units + routes + layout + pi-nav-dropdown separatorLabel
note: dead dictionaries.page.ts → cleanup in DICT-304
next: DONE — parallel DICT-304/305/306/307 RESERVED

### Verdict TZ-DICT-303
status: PASS
notes: Hub + units route + nav groups verified; tsc+65/65 green. Nit: remove unrouted dictionaries.page.ts in DICT-304.
required_fixes: none

---

## TZ-DICT-306 — DONE

date: 2026-08-04
workspace: D:\kppdf-8.0
executor: buffy
archive: tasks/_archive/2026-08/TZ-DICT-306.done.md
checklist: docs/agent-checklists/TZ-DICT-306.md
gates:
  - fe tsc: PASS (Cursor re-run)
  - jest color-references: 18/18 PASS (Cursor)
  - executor dictionaries: 67/67
component: ColorReferencesPage (pages/dictionaries) on PiDictionaryShell
api:
  - title «Цвета (RAL)» + totalLabel («N цветов» / «N из M цветов»)
  - [tools]: search (name/slug) + active filter select (all/active/inactive, page→1) + CTA «+ Создать цвет»
  - default content: error banner + pi-table (pageSize=100, pager N>100) + row-action/name/hex/switch templates
  - system-color contract preserved: isSystem → edit/copy/delete/toggle disabled up front; isDefault delete → backend 409 + toast
conflict_disclosure:
  - frontend/src/app/pages/dictionaries/color-references.page.ts
  - frontend/src/app/pages/dictionaries/color-references.page.spec.ts (+3 tests)
  - docs/pages/color-references.page.md
note: bloat removed (eyebrow/description/section); no product-form / backend / other dict pages / routes touched
next: DONE — archived after Cursor PASS

### Verdict TZ-DICT-306
status: PASS
notes: Shell D1–D2 + sticky search/active/CTA; system-color contract intact; tsc + 18/18 verified.
required_fixes: none
