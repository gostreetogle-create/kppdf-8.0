═══════════════════════════════════════════════════════════════
TZ-UI-TYPE-302: Apply type scale on catalog hotspots
═══════════════════════════════════════════════════════════════

> Проверено: audit 2026-08-08; TYPE-301 must land first (micro=11px).
> Trigger screen: module-detail / product-detail / composition-tree / nav / page-chrome.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-TYPE-301

LAYER: 3

PAGES: /modules/:id ; /products/:id ; /products ; (nav global)
PAGE_DOCS: module-detail.page.md ; product-detail.page.md ; page-chrome.md ; ui-composition-tree.md

CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts; frontend/src/app/shared/page/pi-page-chrome.component.ts; frontend/src/app/shared/ui/composition/composition-tree.component.ts; frontend/src/app/pages/modules/module-detail.page.ts; frontend/src/app/pages/products/product-detail.page.ts; frontend/src/app/shared/ui/fact-card/fact-card.component.ts

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Убрать micro-ад
- Nav labels: `text-[9px]` → минимум `text-[10px]` предпочтительно **`eyebrow` / text-xs`** (читаемый meta). Не раздувать nav высоту без нужды — если 12px ломает бар, оставить 11px via eyebrow class.
- composition-tree: заменить `text-[10px]` type/depth на `text-xs` или `eyebrow`; chevron не больше `text-base`.
- Произвольные `text-[10px]`/`[9px]` в затронутых CONFLICT KEYS → `eyebrow` или `text-xs`.

ШАГ 2: Titles одной семьи
- product-detail + module-detail имя: единый `font-display text-lg` (sm: `text-xl` max).
- page-chrome optional H1: оставить `text-lg` (уже ok).
- НЕ трогать order-detail в этой TZ (known_limitation → successor) кроме если 1-line align cheap.

ШАГ 3: Passport / fact
- Сохранить hierarchy eyebrow → value `text-base` → hint `text-xs`.
- Mono размеры (габариты): `text-sm font-mono` не крупнее surrounding body.

ШАГ 4: Specs + manual
- Update/adjust broken class assertions in specs of touched files.
- Manual light: `/modules/:id` — ПАСПОРТ/состав/nav без «прыжка» 9→18.

НЕ ИЗМЕНЯТЬ: styles.css token definitions (301); color tokens (COLOR-301); builder; supply; desktop.

AC:
1. Нет `text-[9px]` в app-layout nav labels.
2. composition-tree без `text-[10px]` в row chrome (кроме допустимого icon size).
3. module + product detail titles same utility ladder.
4. `pnpm exec tsc -p tsconfig.app.json --noEmit`
5. Relevant jest for touched components pass.
