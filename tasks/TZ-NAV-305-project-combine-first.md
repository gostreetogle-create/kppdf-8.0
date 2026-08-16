# TZ-NAV-305: Проект — сначала Комбайн, потом Очередь

> PO 2026-08-16: «захожу в проекты — пусто; сначала Комбайн, потом очередь».

РОЛЬ АГЕНТА: Frontend (shell nav)

ЗАВИСИМОСТИ: TZ-NAV-303 DONE

LAYER: 1

CONFLICT KEYS: `frontend/src/app/layout/app-layout.component.ts` ; `frontend/src/app/layout/app-layout.nav-order.spec.ts` ; `frontend/src/app/layout/app-layout.component.spec.ts` ; `docs/pages/page-chrome.md` ; `docs/pages/design.page.md` (одна строка порядка, если есть)

PAGES: `/design` ; `/design/combine`  
CHECKLIST: `docs/agent-checklists/TZ-NAV-305.md`  
REVIEW: Cursor PASS

STATUS: READY

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Проект | Nav category `id: 'design'`, shortLabel «Проект» |
| Комбайн | `/design/combine`, pageKey `orders` (канбан) |
| Очередь | `/design` stub «Очередь доукомплектования» |

Проверено: `app-layout.component.ts` items сейчас `Очередь` → `Комбайн`; `entryPath: '/design'`.

## ИСХОДНОЕ

Клик по категории «Проект» / первый пункт flyout ведёт на пустой stub Очереди — оператор видит «ничего нет», хотя Комбайн с заказами рядом вторым.

## ЧТО ДЕЛАТЬ

1. В `design.items` поменять порядок: **сначала** `{ path: '/design/combine', …, label: 'Комбайн' }`, **потом** `{ path: '/design', …, label: 'Очередь' }`.
2. `entryPath` категории `design` → `'/design/combine'` (клик по «Проект» открывает Комбайн).
3. Обновить specs nav-order / layout, если проверяют порядок items или entry.
4. Одна строка в `page-chrome.md` / `design.page.md` если там зафиксирован старый порядок.

## НЕ

- Логика канбана / SWEEP-401  
- Содержимое stub Очереди  
- Deploy (orchestrator после PASS)  
- PHOTO / DASHBOARD-401

## AC

- [ ] Flyout Проект: Комбайн выше Очереди  
- [ ] `entryPath` = `/design/combine`  
- [ ] Gates: FE tsc + `app-layout` (+ nav-order) specs PASS  
- [ ] Archive + lock + push main  

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="app-layout" --coverage=false
```
