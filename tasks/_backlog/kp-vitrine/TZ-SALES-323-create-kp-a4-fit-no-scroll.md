# TZ-SALES-323: Create КП — A4 fit без scrollbar на листе

PAGES: /proposals/create  
PAGE_DOCS: proposals-create.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-preview-wave2.md` §A  
Зависит от: TZ-SALES-321 DONE (фон/layout OK)

РОЛЬ АГЕНТА: fullstack (FE center scale + BE/CSS build HTML overflow)  
ЗАВИСИМОСТИ: нет блокирующих `_active` на тех же keys; не трогать 322 PARK  
LAYER: 3  
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; backend/src/modules/document-template/document-template.service.ts; backend/test/e2e/document-templates-build.e2e-spec.ts; docs/pages/proposals-create.page.md; docs/ux/kp-create-studio-spec.md

Проверено: center iframe 794×1123 + scale (`proposal-create-template-center.component.ts` 120–169); studio `overflow:hidden` (`proposal-create.page.ts` 187–204); `renderHtml` body `padding:20px` + `.doc-content{min-height:297mm}` (`document-template.service.ts` 1064–1070) → внутренний overflow iframe; Quotation ≠ Organization; клиент = Counterparty (не трогаем в этой TZ).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. После 321 PO всё ещё видит H и/или V scrollbar на превью листа.
2. Outer sheet уже `overflow:hidden` + contain scale — **недостаточно**, если документ внутри iframe выше/шире 794×1123.
3. Root cause: build CSS — `body` min 297mm с padding 20px (border-box) и одновременно `.doc-content { min-height: 297mm }` → контент выталкивает scrollable overflow iframe.
4. Spec §0 FROZEN: A4 center, без page-scroll листа; scale можно ужимать сильнее.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **BE `renderHtml` page box (обязательно)**
   - Сделать страницу строго одной «печатной» поверхностью без внутреннего scroll:
     - `html, body { margin:0; overflow:hidden; }`
     - единый page box 210×297mm (portrait) / swap для landscape; **не** раздувать высоту через `doc-content min-height:297mm` поверх `body` с padding.
   - Убрать конфликт padding vs min-height: либо padding 0 на body и внутренние отступы только у блоков/контента в пределах page box, либо page box = fixed height без роста от children.
   - Сохранить существующие borders table / positioned blocks / bg layers.
   - Unit/e2e: build HTML содержит `overflow:hidden` на html/body (или эквивалент, который реально глушит iframe scroll).

2. **FE scale contain (дожать)**
   - Сохранить intrinsic iframe 794×1123 + `transform: scale` + `transform-origin: top center`.
   - Scale = min(sheetW/794, sheetH/1123) — **можно <1 без искусственного «воздуха»**; при необходимости небольшой safety inset (1–2px) чтобы border sheet не давал gutter-scroll.
   - Sheet/stage: `overflow: hidden`; **FAIL** если у sheet или iframe видны scrollbar.
   - ResizeObserver пересчёт сохранить.
   - Не менять grid rails|center|rails и overlay поведение 317.

3. **Тесты + docs**
   - FE jest: scale ≤ sheet; при маленьком sheet scale < 1.
   - BE test/e2e: CSS overflow contract в build output.
   - `docs/pages/proposals-create.page.md` + при необходимости одна строка в spec § A4 fit: «no iframe document scroll».
   - Checklist `docs/agent-checklists/TZ-SALES-323.md` + CLAIM до кода.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `proposal-create-template-center.component.ts` (+ spec page)
- `document-template.service.ts` `renderHtml` CSS only (и тест build)
- page docs / checklist / progress при closeout

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Shell §0 FROZEN (rails, overlay, flushBody) — не «улучшать» layout студии
- Empty table skeleton → **TZ-SALES-324**
- draftLines → table bind → **TZ-SALES-325**
- Snapshot / 322 / print 320 / builder drag / deploy
- Не встраивать BuilderCanvas
- Не менять `BuildDocumentDto` / resolveTableBlock data path

known_limitation:
- Bit-identical print PDF — 320 PARK
- Empty «Нет данных» paragraph — 324
- Products on sheet — 325

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Create КП: при выбранном шаблоне **нет** H/V scrollbar на `.center__sheet` и внутри iframe preview (PO visual + data-test).
2. Лист целиком влезает в center между rails; пропорция 210∶297; top-aligned.
3. Фон и absolute layout после 321 не регрессируют.
4. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
5. Executor report (auto) в checklist; archive только после Cursor/PO visual PASS на scroll.

Финализация: `tasks/_archive/2026-08/TZ-SALES-323.done.md` + GEMINI.md closeout.
