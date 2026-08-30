# NOW - Оперативная доска агента

updated_at: 2026-08-30T13:30:00+03:00

## ACTIVE / LIVE

- `TZ-NX-COMPOSITION-LEGACY-AUDIT` — analysis-only legacy inventory (чужой `_active`)

## ACTIVE / LIVE

- `TZ-NX-REGISTRY-CRUD-UNIFY` / registries wave — другая волна агента (backend + registries/**, composition WIP). Мой scope: S2 shell закрыт, не трогал их ключи.

## DONE this slice

- `TZ-NX-DOCSTUDIO-S2-SHELL` (freebuff-docstudio-s2) — `/studio` list + `/studio/:id` A4 shell, геометрия по `kp-workspace-geometry` (portrait 0.7071 / landscape 1.4143, panel 480px, Δ=0), PATCH-ориентация с revision gate; evidence `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S2-SHELL/`; archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S2-SHELL.done.md`

- `TZ-BACKEND-PDF-FONT-READY` — `font-display: block` + bounded `document.fonts.ready` перед `page.pdf()`; archive `tasks/_archive/2026-08/TZ-BACKEND-PDF-FONT-READY.done.md`

- `TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE` — BlockStyle schema, sanitization, dual render wiring, tests and live API evidence; archive `tasks/_archive/2026-08/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.done.md`

- `TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER` — порядок в `tasks/` (корень = 11 файлов: 6 служебных + 5 активных) + legacy-съёмка живьём (19 скриншотов), геометрия КП числами (480px / 8px / Δ0), defects D1–D9; archive `tasks/_archive/2026-08/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.done.md`
- `TZ-NX-CONSTRUCTOR-SHELL` — `/constructor` shell + header chip + 4 create CTAs; archive `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL.done.md`
- `TZ-NX-CATALOG-DATA-ACCESS-READ` — PiMaterials/PiProducts read-only data-access; archive `tasks/_archive/2026-08/TZ-NX-CATALOG-DATA-ACCESS-READ.done.md`
- `TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ` — materials + details registries on `/registries`; archive `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ.done.md`
- `TZ-NX-COMPOSITION-NX-AUDIT` — IA nx archived (analysis-only PASS)

## PARK

- `TZ-DOC-STUDIO-2006` render extract phase 2 (техдолг)
- template_blocks cutover step 5–6
- TZ-2001 leak audit: run `backend/scripts/tz-doc-studio-2001-dual-read-leak-audit.ts` on prod Mongo before deploy (script in repo, not executed yet)
- Дефекты legacy из `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/defects.md` (D1–D9) — ждут решения PO (каждая → отдельная TZ)

Program: `tasks/_backlog/doc-studio/WAVE-DOC-STUDIO.md` · waves 0–19 + 2001–2004 + UI-301/302 **DONE** (committed) · карта модуля: `docs/architecture/nx-doc-studio.md`
