# TZ-SALES-321: Create КП preview fidelity (layout + bg + scale)

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: `docs/audits/2026-08-09-kp-create-template-preview-fidelity-fail.md`
Зависит от: TZ-SALES-319 (wiring build есть; **visual FAIL**)

РОЛЬ АГЕНТА: fullstack — починить parity builder ↔ build HTML в Create КП.
ЗАВИСИМОСТИ: 319 код в working tree / main; не archive 319 DONE без этого PASS.
LAYER: 3
CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts; backend/test/e2e/document-templates-build.e2e-spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md

Проверено: mongoose `{...doc}` → keys `$__`,`_doc`, `layout` undefined; `toObject().layout` ok; `resolveTableBlock`/`resolveBlockContent` spread; renderHtml `blockLayoutStyle`; Create iframe no scale; proxy `/uploads`→:3000; builder CSS bg vs build `<img>`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Create КП: broken bg icon, H/V scroll, контент сверху («Нет sample rows…»).
2. Builder: фон виден, 4 блока на layout-позициях.
3. Причина позиций: spread Mongoose Document в build pipeline убивает `layout`.
4. Scale: iframe без contain.
5. Bg: img в sandbox srcdoc ненадёжен vs page CSS.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **BE layout preserve**
   - Во всех местах `return { ...block, … }` в `document-template.service.ts` (`resolveBlockContent`, `resolveTableBlock`) клонировать через `block.toObject({ virtuals: false })` (или эквивалентный явный pick **включая `layout`**).
   - Не оставлять «голый» object-spread Document.
   - E2E или unit: шаблон с block.layout → `POST build` HTML содержит `position:absolute` и `left:`/`top:` проценты (не только flow `.block`).

2. **FE fit без скролла**
   - Sheet: **нет** горизонтального/вертикального scrollbar у превью.
   - Вписать страницу 210∶297 в `.center__sheet` через scale (transform), top-aligned; overflow hidden на sheet.
   - При resize — пересчитать scale (ResizeObserver ok).

3. **FE фон `/uploads`**
   - Сделать загрузку bg в iframe надёжной: rewrite относительных `/uploads/…` (и в img, и если нужно) на absolute origin API **или** `sandbox="allow-same-origin"` без `allow-scripts` + base href на app origin (proxy).
   - AC: на шаблоне с `backgroundImage` в Create КП фон **виден** (не broken icon). Ручной visual PO.

4. **Таблица empty (желательно в этой TZ)**
   - В Create-превью не показывать сырое «Нет sample rows для preview. Добавьте sampleRows.» — заменить на короткое RU «Нет данных» в table preview path **или** в FE post-process HTML (предпочтительно поправить `TableTemplateService.preview` empty copy на RU product-facing, если не ломает tables admin).
   - Если спор — known_limitation + successor; позиции/фон/scale обязательны.

5. **Тесты + docs**
   - Jest proposal-create: scale/container data-test; mock build HTML с `position:absolute` остаётся в iframe.
   - BE test на layout в build.
   - Page doc: fidelity notes; checklist 321.
   - После PASS: archive **321** + закрыть **319** (DONE visual) одним closeout если 319 ещё в `_active`.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Builder canvas drag/editor (кроме read-only сверки)
- Snapshot/lock NOTE / persist Quotation
- SALES-318 cascade, 320 print
- DOC-344 keys без нужды
- deploy

known_limitation:
- Bit-identical editor chrome (handles) не нужен — только presentation.
- draftLines → table bind later.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Build HTML для блока с layout содержит absolute positioning (%).
2. Create КП: нет H/V scroll на sheet; A4 целиком влезает.
3. Фон шаблона виден в Create КП (тот же шаблон, что в builder).
4. Тексты/таблицы визуально на тех же местах, что в builder Preview (PO visual).
5. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
6. Checklist + Executor report; archive после Cursor/PO visual PASS.
7. Deploy: НЕТ.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md closeout → `_archive/2026-08/TZ-SALES-321.done.md` + при открытом 319 — archive 319 DONE со ссылкой на 321 fix.
