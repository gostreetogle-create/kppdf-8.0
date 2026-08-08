═══════════════════════════════════════════════════════════════
TZ-UX-DETAIL-303: Правый inspector «Выбрано» → FactCard секции
═══════════════════════════════════════════════════════════════

STATUS: READY (FACT-301 + DETAIL-301/302)

РОЛЬ: Frontend

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.spec.ts;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-UX-DETAIL-303.md;

НЕ: composition-tree markup/behavior; deploy

---

## ЧТО ДЕЛАТЬ

1. Inspector только: секции Что / Количество / Деньги / Действия на PiFactCard/Stack.
2. Кнопки («+ Из каталога», Убрать, Открыть, Обновить) — в секции Действия, не вперемешку с текстом.
3. Дерево состава не менять.

## AC

- [ ] Правая колонка читаема по секциям
- [ ] Tree untouched; jest bom-panel; tsc; archive; push
