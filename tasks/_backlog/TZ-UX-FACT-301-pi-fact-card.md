═══════════════════════════════════════════════════════════════
TZ-UX-FACT-301: PiFactCard + FactStack (UI kit)
═══════════════════════════════════════════════════════════════

STATUS: READY · можно ∥ long-haul

РОЛЬ: Frontend shared UI

LAYER: 2

CONFLICT KEYS:
frontend/src/app/shared/ui/fact-card/**;
docs/pages/ui-fact-card.md;
docs/agent-checklists/TZ-UX-FACT-301.md;

НЕ: product-detail wiring (DETAIL-301+); composition-tree; deploy

---

## ЧТО ДЕЛАТЬ

1. Standalone `PiFactCardComponent` + `PiFactStackComponent` по ui-fact-card.md.
2. Story/jest smoke: label/value/caption/actions.
3. Export barrel. Не подключать к detail в этом TZ (кроме optional playground если есть).

## AC

- [ ] Компоненты есть; docs; jest; tsc; archive; push
