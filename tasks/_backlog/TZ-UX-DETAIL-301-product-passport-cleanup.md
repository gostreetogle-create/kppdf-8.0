═══════════════════════════════════════════════════════════════
TZ-UX-DETAIL-301: Левый паспорт — без ценовой каши
═══════════════════════════════════════════════════════════════

STATUS: READY (после long-haul DEDUP-304 / не параллелить с DEDUP-304)

РОЛЬ: Frontend

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/products/product-detail.page.ts;
docs/pages/product-detail.page.md;
docs/audits/2026-08-08-product-detail-side-panels-cost.md;
docs/agent-checklists/TZ-UX-DETAIL-301.md;

НЕ: composition-tree; BomPanel inspector; cost recalc API; deploy

---

## ЧТО ДЕЛАТЬ

1. Убрать из hero сетку Прайс/Себест/База/В составе (цены уедут в DETAIL-302).
2. Оставить: фото, имя, SKU/kind, badges, **В составе** (count) как meta ок.
3. Габариты/вес/RAL — крупнее, читаемый fact-list (можно PiFactCard).
4. Typography: убрать «невидимый» text-[11px] где это главный контент.

## AC

- [ ] Слева нет загадочных ₽-плиток
- [ ] Размеры читаемы; tsc; archive; push
