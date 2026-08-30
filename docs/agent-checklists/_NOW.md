# NOW - активная очередь агента

updated_at: 2026-08-30T23:00:00+03:00

## ACTIVE / LIVE

**ACTIVE TZ:** _(none — S8 wave READY, see `tasks/WAVE-DOCSTUDIO-S8.md`)_

S7 wave COMPLETE and **committed+pushed** as `a7b54868` + docs sync `f4490ef7`.
Local **unpushed:** `094d41df` (ribbon 26px + image layer polish) — push with doc audit commit.

**Operator SoT (2026-08-30 audit):** full UI map + substitution flow +
gaps → `docs/pages/document-studio.page.md` (§1–§7). Key finding: **текстовые
`{{токены}}` и таблица←КП не дожимают до Preview** — S8-1/S8-2 TZ written.

**Encoding incident (2026-08-30):** resolved in Claude pass; rules `docs/ENCODING.md`.
Studio Cyrillic verified clean; do not PowerShell-write UTF-8 without BOM=false.

**Not committed, flagged to PO:** RBAC WIP → `TZ-AUTH-RBAC-ROLE-PERMS.md` (security).
Studio image stagger WIP in working tree — not in TZ; stash or own micro-TZ tomorrow.
docker-compose healthcheck tweak — ops-only, not in doc commit.

## DONE this slice

- TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER — archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER.done.md`; gates data-access tsc / nx test studio / nx build exit 0; save-as-template unblocked when `docTypeId` set

- TZ-NX-DOCSTUDIO-S7-PASSPORT-BG (S7-6) — archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S7-PASSPORT-BG.done.md`; gates tsc / nx test studio / nx build exit 0

- TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT (S7-5) - archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT.done.md`; gates tsc / nx test studio / nx build exit 0; live smoke SKIP (login 401)


- TZ-NX-DOCSTUDIO-S7-TABLE-POLISH (S7-4) - archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S7-TABLE-POLISH.done.md`; gates tsc / nx test / nx build exit 0

- TZ-NX-DOCSTUDIO-S7-RAILS-DATA (S7-1) — archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S7-RAILS-DATA.done.md`; gates tsc / nx test studio / nx build exit 0

- `TZ-NX-DOCSTUDIO-ELEMENT-CREATION-AND-RAIL-FIX` — принял и закрыл
  in-progress работу Cursor по Студии (реальный табличный редактор, рельс
  Элементы/Слои/Свойства, ~1700 строк); нашёл и починил 2 живых бага:
  (1) «+ Текст»/«+ Фото» были задизейблены на пустом документе — самое
  первое естественное действие ничего не делало; (2) `ShellToolRailService`
  после рефакторинга рельса терял дефолтные плейсхолдеры на ВСЕХ страницах,
  не только Студии — это и был тот самый «чужой несвязанный» app-shell тест,
  который тянулся с A4 (оказался связан). Live-verified + 4 новых теста;
  archive `docs/agent-checklists/TZ-NX-DOCSTUDIO-ELEMENT-CREATION-AND-RAIL-FIX.md`
- `TZ-NX-REGISTRIES-BROWSER-MATRIX-2` (Wave A6, `WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`) —
  честный живой обход всех 10 реестров (прошлая версия сама признавала
  "live screenshots unavailable", 120/120 из code-review); нашёл и починил
  2 реально сломанных create-диалога (text-blocks: NG01203 rich-text;
  table-templates: FormArray не зарегистрирован) — оба live-verified
  реальным round-trip через API; archive
  `tasks/_archive/2026-08/TZ-NX-REGISTRIES-BROWSER-MATRIX-2.done.md`
- `TZ-NX-PRODUCT-COMPLEX-COMPOSITION` (Wave A5, `WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`) —
  список изделий теперь реально отдаёт `isComplex` (раньше только detail),
  фильтр «Все/Комплекс/Обычное» на реестре; live-verified API (5 комплексов
  из 68) + скриншот браузера; archive
  `tasks/_archive/2026-08/TZ-NX-PRODUCT-COMPLEX-COMPOSITION.done.md`
- `TZ-NX-DETAIL-MATERIAL-BOM` (Wave A4, `WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`) —
  заменил notes-хак (`__DETAIL_BOM__`) на настоящий backend composition для
  Материала (тот же API/UI, что у Product/Module); live-verified API +
  реальный браузер (Playwright); archive
  `tasks/_archive/2026-08/TZ-NX-DETAIL-MATERIAL-BOM.done.md`
- `TZ-NX-COMPOSITION-PICKER-PARITY` (Wave A3, `WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`) —
  confirmed root cause of the reported "500 BSONError on module composition":
  `resolveMaterialId()` unwraps populated legacy `materials[].materialId`;
  live-swept all 21 modules + 68 products (0 errors), live-verified nested
  module-in-module add via real UI flow; archive
  `tasks/_archive/2026-08/TZ-NX-COMPOSITION-PICKER-PARITY.done.md`
- `TZ-NX-COMPOSITION-ERROR-I18N` (Wave A2, `WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`) —
  frontend banner+toast wiring was already correct; real gap was backend
  `http-exception.filter.ts` never matching class-validator's actual
  generated text (verified live against 3 real fields: refId/IsMongoId,
  lineType/IsIn, quantity/IsNumber+Min) — fixed + regression-tested;
  archive `tasks/_archive/2026-08/TZ-NX-COMPOSITION-ERROR-I18N.done.md`
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

- `table-templates` create/edit dialog: after A6's FormArray fix, a
  non-blocking `TypeError: newCollection[Symbol.iterator] is not a
  function` still fires from Angular's `@for` reconcile while column rows
  render. Confirmed pre-existing (present in the original broken state
  too, alongside the now-fixed crashes) — not introduced by the fix. Save
  works correctly end-to-end regardless. Root cause not isolated in the
  time available.
- `docs/pages/registries.page.md` still mentions "Открыть в Конструкторе"
  for materials/products row actions — the action was already cleanly
  removed from the actual code (tests enforce its absence); this is stale
  doc text, not a live dead button. One-line fix whenever someone's next
  in that file.

- Деталь's own raw-material BOM doesn't appear nested inside a Product's
  full tree view when that Деталь is used inside a Module — found during
  A4. `catalog-graph.service.ts`'s shared `getChildren()` short-circuits
  `lineType === 'material'` to `[]` for every material, not just raw ones;
  loosening it to recurse into a part-kind material's own composition
  would fix this but touches the same cycle-sensitive recursive walk every
  Product/Module tree relies on — bigger blast radius than A4's isolated
  `buildMaterialTree()` addition → own TZ.
- ~~App-shell rail-layout test failure~~ — **RESOLVED** by
  `TZ-NX-DOCSTUDIO-ELEMENT-CREATION-AND-RAIL-FIX`: turned out to be a real
  side effect of the app-wide `ShellToolRailService` refactor (empty
  default rail instead of demo placeholders), not an unrelated concern as
  first assumed during A4.
- Nested `@ValidateNested()` DTO validation errors (e.g.
  `overrideDimensions.unit`) still return NestJS's raw multi-line
  "An instance of X has failed the validation..." dump untranslated — found
  live during A2, different root cause than the fixed dictionary bug (needs
  a custom `exceptionFactory` on the global `ValidationPipe`, likely in
  `main.ts`), broader blast radius (every nested DTO in the app) → own TZ.
- `TZ-DOC-STUDIO-2006` render extract phase 2 (техдолг)
- template_blocks cutover step 5–6
- TZ-2001 leak audit: run `backend/scripts/tz-doc-studio-2001-dual-read-leak-audit.ts` on prod Mongo before deploy (script in repo, not executed yet)
- Дефекты legacy из `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/defects.md` (D1–D9) — ждут решения PO (каждая → отдельная TZ)

Program: `tasks/_backlog/doc-studio/WAVE-DOC-STUDIO.md` · waves 0–19 + 2001–2004 + UI-301/302 **DONE** (committed) · карта модуля: `docs/architecture/nx-doc-studio.md`

