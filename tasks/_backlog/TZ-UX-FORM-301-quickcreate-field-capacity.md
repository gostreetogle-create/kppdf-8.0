═══════════════════════════════════════════════════════════════
TZ-UX-FORM-301: QuickCreate — ёмкость полей + плотная упаковка
═══════════════════════════════════════════════════════════════

> READY · PO: скролл в «Быстрое создание: Изделие» L из‑за наивной 2-col сетки
> и огромных ячеек для Д/Ш/В/веса. Shell A–D (DIALOG-302) не откатывать —
> чинить **внутри** формы.

STATUS: DONE

РОЛЬ: Frontend (QuickCreate / form density)

ЗАВИСИМОСТИ: TZ-UX-DIALOG-302 DONE; audit docs/audits/2026-08-08-form-field-capacity-canon.md

LAYER: 3

PAGES: /products ; /modules
PAGE_DOCS: ui-form-field-capacity.md ; ui-dialog-canon.md

Проверено: frontend/.../quick-create-dialog.component.ts (grid-cols-2, textarea rows=3);
  field-key-registry.ts; form-profiles.service.ts PRODUCT_FIELD_KEYS;
  docs/audits/2026-08-08-form-field-capacity-canon.md; docs/pages/ui-form-field-capacity.md

CONFLICT KEYS:
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts;
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts;
frontend/src/app/shared/ui/quick-create/field-key-registry.ts;
frontend/src/app/shared/ui/quick-create/field-capacity.ts;
docs/DIALOG-COOKBOOK.md;
docs/pages/ui-form-field-capacity.md;
docs/audits/2026-08-08-form-field-capacity-canon.md;
docs/agent-checklists/TZ-UX-FORM-301.md;
docs/agent-checklists/_active-map.md;

НЕ ИЗМЕНЯТЬ:
- BE form-profiles / allowlist FieldKey / locked required
- PiDialog width tiers / SIZE_TO_WIDTH откат
- admin/**; app-layout nav; FullEditor product (successor); deploy
- global density.service

---

## ИСХОДНОЕ

- M/L: `md:grid-cols-2` → каждое поле 50% ширины.
- Габариты product: dimLength/dimWidth/dimHeight/dimUnit/weightKg — отдельные полуряды.
- textarea rows=3 × 2 = лишняя высота → body scroll при max-h 70vh.

## ЧТО ДЕЛАТЬ

1. Добавить `field-capacity.ts` (или секцию в registry):
   - `export type FieldCapacity = 'nano'|'xs'|'sm'|'md'|'lg'|'full'`
   - `FIELD_CAPACITY` для всех PRODUCT_FIELD_KEYS + MODULE_FIELD_KEYS по таблице аудита §4.
   - `spanFor(capacity)` → число колонок 12-grid (nano=2, xs=2|3, sm=3|4, md=4|6, lg=6|8, full=12) — зафиксируй одну таблицу в коде + комментарий «см. ui-form-field-capacity.md».

2. QuickCreate layout (M/L desktop):
   - Заменить наивный `grid-cols-2` на **12-col** grid (`md:grid-cols-12`) + `col-span-*` с поля.
   - Компактный gap: `gap-x-3 gap-y-2` (не крупный `gap-form-field`).
   - nano/xs: input `max-w` ориентир из аудита (цифры не растягивать на всю огромную ячейку без нужды — ячейка span ок, control может быть уже).
   - Габарит-band: идущие подряд dim*/weight* (product) или width/height/depth/weight (module) остаются в одном визуальном ряду при сумме span ≤ 12.
   - textarea: `rows={2}`, span full.

3. S-профиль: 1 col допустим; capacity spans можно игнорировать (&lt;md всегда 1 col).

4. Jest:
   - capacity map покрывает все allowlisted keys;
   - L + product keys → grid class 12-col; dimLength span nano; description full;
   - не ломать существующие smoke open/submit тесты.

5. Docs: одна строка в DIALOG-COOKBOOK (kind B → ссылка на field capacity); checklist DONE; map.

## КРИТЕРИИ ПРИЁМКИ

- [ ] FIELD_CAPACITY для всех product/module keys; нет ключей вне allowlist
- [ ] QuickCreate M/L: 12-col packing; габариты+вес в одном ряду на desktop
- [ ] textarea rows ≤ 2; gap компактный
- [ ] AC browser (ручной в отчёте): product L типичный набор — **нет** заметного body-scroll на ≥1280×720 (или скролл &lt; ~40px)
- [ ] jest quick-create PASS; `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] archive + commit + push; deploy нет

Verification:
```
cd frontend && pnpm exec jest src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts --no-cache
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
