# TZ-SUPPLY-308 — Полоса «Поставщик»: категория, контакты, единый +

**Status:** READY — mock UI; PO 2026-08-19 волна 3.

```
DEPENDS ON: TZ-SUPPLY-307 DONE
CONFLICT KEYS: frontend/src/app/pages/supply/supply-quick-order.*
```

## PO intent

1. **Имена полос — одно слово** (макс. два):  
   `Позиция` | `Поставщик` | `Контекст` | `Статус` (вместо «Что заказать», «Откуда купить», «Статус и приоритет»).

2. **Поставщик фильтруется по категории материала** строки (`categoryId` → suppliers с `categoryIds[]`).

3. **При создании поставщика** — привязать категорию строки к org (`categoryIds` mock; 305 → Organization field).

4. **Зелёный +** у поставщика и у **менеджера** (не «+ Новый» текст).

5. **Полоса «Поставщик» (компактные поля lg+):**  
   Поставщик ▾ | + | Менеджер ▾ | + | Сайт | Почта поставщика | Почта менеджера. Ссылка на товар живёт в полосе «Позиция».

6. **Panel «+ поставщик»:** только название org*, категория (pre-filled row category, checkbox/read-only), сайт, email org. Save → mock org, select supplier, close. Менеджер выбирается отдельным select в полосе; если контактов нет — менеджер создаётся через соседний `+` уже после сохранения поставщика и автоматически привязывается к выбранному supplier.

7. **Panel «+ менеджер»** (если supplier выбран, disabled иначе): Фамилия*, Имя, Отчество, тел, email → mock contact linked to supplier; auto-select.

8. **Единая база (305):** org → `Organization` type supplier; contact → `Worker` with `supplierId`, `position`; **не** второй справочник.

## Mock model

```ts
QuickOrderSupplier { id, name, website?, email?, categoryIds: string[] }
QuickOrderSupplierContact { id, supplierId, lastName, firstName?, patronymic?, phone?, email?, position? }
```

Seed: Кубаньподшипник → cat-podshipniki; profrezi.ru → cat-osnastka; contacts per supplier.

Row: `supplierContactId?: string | null`

## НЕ в 308

- Backend POST org/worker
- Контекст / Статус полосы (следующая волна)

## AC

1. Strip labels renamed (4 one-word)
2. Suppliers filtered by row categoryId
3. Green + supplier & + manager; panels compact (306 style)
4. Create supplier binds category and selects the new supplier; manager is optional and created separately
5. Create manager requires supplier selected
6. data-test: supplier-add, supplier-panel, manager-select, manager-add, manager-panel
7. tsc + supply tests PASS

## 305 note

- `Organization.supplierCategoryIds[]` or reuse tags
- `Worker.supplierId` on manager create
- Filter `GET /organizations?type=supplier&categoryId=`
