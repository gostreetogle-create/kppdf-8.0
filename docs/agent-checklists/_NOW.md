# NOW - Оперативная доска агента

updated_at: 2026-08-30T17:55:20+03:00

## ACTIVE / LIVE

Пусто — `tasks/_active/` пуст, живых claim нет (проверено 2026-08-30 17:55).

Следующий шаг по `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`: A2
`TZ-NX-COMPOSITION-ERROR-I18N`.

## DONE this slice

- `TZ-NX-REGISTRY-PRODUCT-FORM-UX` (Wave A1, `WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`) —
  форма изделия: секция «Изделие», без превью паспорта, derived-Комплекс hint,
  описание+заметки в 2 колонки; live-verified (Playwright, не только code review);
  archive `tasks/_archive/2026-08/TZ-NX-REGISTRY-PRODUCT-FORM-UX.done.md`
- `TZ-NX-REGISTRY-CRUD-UNIFY` (+ closeout) — единый CRUD во всех реестрах, снос «Конструктор»; commit `f06ef170`; spec/prompts в `tasks/_archive/2026-08/`
- `TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS` (+ `S3-SHELL-WIRE` CRLF-обход) — текстовые блоки на листе студии; commit `b09464a3`; spec/prompts в `tasks/_archive/2026-08/`
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
