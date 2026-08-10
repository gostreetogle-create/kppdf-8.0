# TZ-SALES-326: Create КП — шире витрина-flyout + dismiss вне панели

PAGES: /proposals/create  
PAGE_DOCS: proposals-create.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-product-vitrine.md`  
Зависит от: **TZ-SALES-323 DONE** (CONFLICT на `proposal-create.page.ts`); не claim параллельно с 323–325 на том же файле

РОЛЬ АГЕНТА: frontend  
ЗАВИСИМОСТИ: 323 visual PASS (или 323 уже archived); 324/325 могут идти до/после, но **не одновременно** на create page  
LAYER: 3  
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/ux/kp-create-studio-spec.md; docs/pages/proposals-create.page.md

Проверено: `--kp-flyout-w: min(20rem, …)` (`proposal-create.page.ts` ~206); click-outside `document:pointerdown` (~377–397) не ловит клики **внутри iframe** превью; Escape уже закрывает; Quotation/Counterparty N/A.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Products overlay ~20rem — узко для сетки карточек с фото.
2. PO: клик вне витрины / вне параметров должен закрывать панель; сейчас ненадёжно (особенно клик по A4 iframe).
3. Spec §0 FROZEN: A4 не сжимается; rails icon-only; overlay поверх center.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Ширина products flyout**
   - Для `data-flyout="products"` (и только его) ширина ≈ **2×**: целевой диапазон **36–40rem**, capped `min(40rem, calc(100% - 2*rail - 1rem))`.
   - Template flyout может остаться ~20rem (или тот же cap — не раздувать picker без нужды).
   - Right params: не обязательно ×2; оставить читаемым (~20–24rem OK), если не мешает.
   - Grid rails|center|rails **не** менять; A4 intrinsic не зависит от open.

2. **Dismiss вне панели (L + R)**
   - Клик по center / A4 / пустому studio **вне** flyout+icon-rail → `closeFlyouts()` (leftTool=null, rightOpen=false).
   - Надёжный путь при iframe: полупрозрачный/прозрачный **backdrop** под flyout поверх center (pointer-events), клик по backdrop закрывает; **или** эквивалент без ломки sandbox iframe.
   - Клик внутри flyout / rail buttons / CDK overlay (select/dialog) — **не** закрывать.
   - Escape сохранить.
   - Jest: pointer на backdrop/outside → flyouts closed; inside flyout → open.

3. **Docs**
   - Spec §3: products overlay width + dismiss via backdrop/outside (iframe caveat).
   - `proposals-create.page.md` одна строка.
   - Checklist `docs/agent-checklists/TZ-SALES-326.md`.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Содержимое rail (карточки) → **328**
- PiShowcaseCard → **327**
- draftLines / build / 323–325 logic
- Snapshot 322 / print 320 / deploy / DOC-344
- Docked 3-колонки / сжимать A4

known_limitation: красивая сетка карточек — 328; category cascade дерево — later.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Products flyout визуально ≈×2 шире прежнего 20rem (измеримо в CSS var/class).
2. Клик по области листа/center (вкл. сценарий с iframe preview) закрывает **и** товары, **и** параметры.
3. Клик внутри flyout не закрывает; Escape закрывает.
4. A4 ширина между rails не меняется при open/close.
5. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
6. Archive после Cursor/PO visual PASS (ширина + dismiss).

Финализация: `tasks/_archive/2026-08/TZ-SALES-326.done.md`.
