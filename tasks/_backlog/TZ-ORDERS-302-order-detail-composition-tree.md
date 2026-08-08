═══════════════════════════════════════════════════════════════
TZ-ORDERS-302: Карточка заказа — дерево вложенности как composition-tree
═══════════════════════════════════════════════════════════════

> PARK / READY-черновик · **не начинать код** без PO un-park  
> Зафиксировано 2026-08-08: PO хочет **переиспользовать** каскад состава
> (изделие→изделие→модуль…) на заказе: заголовок «Заказ №…» вместо «Состав»;
> внутри — изделия заказа и их вложенный BOM целиком. Статусы — later.
>
> Образец UI (обязательно сохранить / не потерять):
> - Канон: `docs/pages/ui-composition-tree.md` §«Переиспользование»
> - Скрин dark: `docs/pages/assets/composition-tree-cascade-dark-2026-08-08.png`
> - Код: `app-composition-tree` (+ ProductBomPanel как эталон потребителя)

STATUS: PARK (завтра: уточнить data model → потом un-park)

РОЛЬ АГЕНТА: Frontend (+ тонкий BE read, если нужен order BOM aggregate)

ЗАВИСИМОСТИ:
- Composition-tree click/containment DONE (330–334; dark 335 желателен до показа)
- ORDERS-301 quote→order DONE (архив)
- Domain preflight: что является корнем дерева на Order (lines → Product refs →
  composition snapshot vs live catalog)

LAYER: 3 (если правит shared tree) / 2 (если только order page wrapper)

PAGES: `/orders/:id` (или detail dialog — выбрать в preflight)
PAGE_DOCS: `docs/pages/orders.page.md` (+ новый order-detail.page.md при создании)

CONFLICT KEYS (черновик — уточнить на un-park):
frontend/src/app/pages/orders/**;
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
docs/pages/ui-composition-tree.md;
docs/pages/orders.page.md;
docs/agent-checklists/TZ-ORDERS-302.md;

---

## Цель (PO)

Менеджер открывает заказ и **видит заказ целиком**: какие изделия, что внутри
каждого (модули/детали), тем же каскадом карточек+rail, что на карточке изделия.
Позже — статусы на узлах (не в P0 этого TZ).

## ЧТО ДЕЛАТЬ (когда un-park)

1. Domain preflight: live composition vs snapshot на момент заказа (CORE-301).
2. UI shell: chrome «Заказ №…» + `app-composition-tree` (не копипаста стилей).
3. Данные: lines заказа → nodes; expand тянет/мапит children.
4. Empty / partial warnings; RU copy.
5. Статусы — **out of scope** (successor) или тонкий badge-slot без бизнес-логики.

НЕ: Гант; переписывать composition-tree с нуля; Excel-колонки; deploy без PO

AC (после un-park): дерево заказа визуально = канон composition-tree;
документировано в orders.page.md; gates FE.

known_limitation: пока PARK — только фиксация намерения, чтобы не потерять фишку.
