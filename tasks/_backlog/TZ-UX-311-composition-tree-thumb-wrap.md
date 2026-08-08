═══════════════════════════════════════════════════════════════
TZ-UX-311: Состав — мини-фото + перенос длинного названия
═══════════════════════════════════════════════════════════════

STATUS: READY · **NEXT**

РОЛЬ: Full-stack thin (catalog-graph + composition-tree)

LAYER: 3

PAGES: /products/:id ; /modules/:id ; /orders/:id (reuse tree)
PAGE_DOCS: ui-composition-tree.md

Проверено: composition-tree — имя в `truncate` (одна строка + …);
  CompositionTreeNode / TreeNode без photo; дерево из
  catalog-graph.service getTree; PO скрин «Состав» без превью.

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts;
frontend/src/app/shared/services/pi-product-modules.service.ts;
backend/src/modules/catalog-graph/catalog-graph.service.ts;
backend/src/modules/catalog-graph/**/*.spec.ts;
docs/pages/ui-composition-tree.md;
docs/agent-checklists/TZ-UX-311.md;
docs/agent-checklists/_active-map.md;
tasks/_backlog/QUEUE.md;

НЕ: QuickCreate/FORM; page chrome UX-309; менять BOM add/remove API;
    deploy; новый вид дерева

---

## 1. Данные (BE thin)

В `TreeNode` добавить optional:
- `photoUrl?: string` — URL главного фото (или первый доступный), если есть
- либо `hasPhoto?: boolean` + url

Источник: существующие photoIds продукта/модуля/материала + Photos storage URL
(как уже отдаёт FE на списках/карточках — не invent CDN).  
Нет фото → поле отсутствует (не null-спам).

Не ломать контракт остальных полей дерева.

## 2. UI (FE)

В строке `app-composition-tree` после бейджа ИЗД/МОД/МАТ, **перед** именем:

- мини-превью ~20–24px, `rounded-sm`, `object-cover`, `shrink-0`
- если `photoUrl` — `<img>`; иначе нейтральная иконка Image (lucide) opacity ~0.45
  (чтобы сетка строк не прыгала)

Имя:

- убрать `truncate` (ellipsis одной строки)
- `line-clamp-2` + `break-words` / `overflow-wrap` — максимум **2 строки**,
  не вылезать за ширину строки (qty/счётчик справа `shrink-0` как сейчас)
- `title` = полное имя (для hover)

## 3. Docs + tests

- строка в `ui-composition-tree.md`
- jest: wrap class / thumb present when photoUrl; BE unit если есть graph specs
- tsc FE + BE

## AC

- [ ] В составе видно мини-фото или placeholder-иконку у узла
- [ ] Длинное имя переносится на 2-ю строку, не уезжает под qty / за край
- [ ] Product + module tree (и заказ, если тот же component) без регресса клика строки
- [ ] gates PASS; archive; push; deploy нет

Verification:
```
cd frontend && pnpm exec jest src/app/shared/ui/composition/composition-tree.component.spec.ts --no-cache
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
```
