# TZ-NX-COMPOSITION-TREE-TOGGLE-HIT: toggle закрытия + большая зона клика

> **SIZE:** S · **PAGES:** orders (workspace + hub), catalogs using tree  
> **PAGE_DOCS:** `docs/pages/ui-composition-tree.md` (если есть) / `orders.page.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/composition/ui/composition-tree.component.ts`; `composition-tree.component.spec.ts`; `frontend-nx/libs/features/src/lib/order-workspace/ui/order-ws-composition.component.ts` (+ spec если есть)

### Preflight / root cause
В `composition-tree.component.ts` `onRowClick`:
```ts
if (selected && expanded) setExpanded(false); else setExpanded(true);
```
На карточке заказа `[selectedId]="null"` → `selected` всегда false → **второе нажатие снова только open**, collapse невозможен. PO visual FAIL на `/orders/:id` составе.

Также: визуально «тыкать» хочется в стрелку+бейдж+имя; сейчас row уже clickable целиком, но collapse broken + возможно mousedown preventDefault мешает ощущению. Усилить hit: min 44px, toggle+kind+name как явная зона; клик по qty не обязан (qty только depth>0 display).

## ЧТО ДЕЛАТЬ

### 1. Toggle expand независимо от selectedId
- Если `hasChildren`: **всегда** `setExpanded(id, !expanded)` (чистый toggle).
- `selectedChange` по-прежнему emit (для экранов с selection).
- Не требовать `selected && expanded` для close.

### 2. Hit target
- Row уже `min-h-11` — оставить/усилить.
- Toggle chevron: не меньше `w-9 h-9` / touch; клик по **имени и kind badge** = тот же toggle (уже через row click — после фикса toggle достаточно; добавить spec).
- Не ставить toggle только на крошечный `›`.

### 3. Линия заказа (order-ws-composition)
- Расширить зону раскрытия дерева линии: клик по **▸ + название изделия** (не по qty/ready/delete) → `toggleTree`.
- `data-test="composition-line-expand"` может быть на button-группе chevron+title.

### 4. Specs
- Click 1 → nest visible; click 2 same row → nest gone (**с selectedId=null**).
- Line expand: title click toggles.

## НЕ
- Менять BOM API / catalog write
- Ломать экраны где selectedId реально используется (после toggle они тоже смогут закрывать — лучше)
- Deploy

## AC
1. На `/orders/:id` с `selectedId=null`: повторный клик по строке дерева сворачивает.
2. Клик по имени/бейджу тоже toggle.
3. Focused composition-tree + order-ws-composition specs PASS; `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern=composition-tree --skip-nx-cache
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=order-detail --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
