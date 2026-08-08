═══════════════════════════════════════════════════════════════
TZ-UX-DETAIL-302: Себестоимость — вертикально + автопересчёт
═══════════════════════════════════════════════════════════════

STATUS: READY (после DETAIL-301; FACT-301)

РОЛЬ: Frontend (+ тонкий hook на composition success)

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/shared/services/*cost*;
docs/audits/2026-08-08-product-detail-side-panels-cost.md;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-UX-DETAIL-302.md;

НЕ: менять формулы COST-305; composition-tree visuals; deploy

---

## ЧТО ДЕЛАТЬ

1. Блок «Себестоимость» / деньги: Прайс + Себест + База с **caption** из аудита §2;
   журнал расчётов — **вертикальный** список/карточки, **без** horizontal scroll.
2. Кнопку «Пересчитать» сохранить.
3. После успешного add/remove/qty на корневом изделии — auto recalculate
   (debounce 300–500ms, один in-flight). Сигнал из BomPanel → detail.
4. Не дёргать на select строки.

## AC

- [ ] Нет h-scroll в блоке денег
- [ ] Captions под ценами
- [ ] Auto recalc после mutate состава
- [ ] jest/tsc; archive; push
