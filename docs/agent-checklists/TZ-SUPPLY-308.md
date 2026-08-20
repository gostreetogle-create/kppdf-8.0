# TZ-SUPPLY-308 checklist

> Status: **READY FOR REVIEW** (PO visual accept pending)
> TZ: `tasks/TZ-SUPPLY-308-supplier-strip-contacts.md`
> Design canon §12: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`

## Claim slot

- agent_id: cursor frontend subagent
- claimed_at: 2026-08-19T19:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- conflict keys: `frontend/src/app/pages/supply/supply-quick-order.component.ts`,
  `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`,
  `frontend/src/app/pages/supply/supply-quick-order.mock.ts`

## Preflight

- [x] TZ-308 прочитана; 306 (compact strips) и 307 (material picker) на месте
- [x] Mock — единственный потребитель `supply-quick-order.mock.ts` (grep: только компонент)
- [x] Backend не трогаем (305)

## Acceptance

- [x] AC1 — полосы переименованы в одно слово: `Позиция` · `Поставщик` · `Контекст` · `Статус`
- [x] AC2 — поставщики фильтруются по `row.categoryId` (`categoryIds[]`), select disabled без категории
- [x] AC3 — зелёный `+` у поставщика и у менеджера (inline-add текст «+ Новый» удалён вместе с CSS),
      панели — компактные dashed в стиле 306
- [x] AC4 — panel «+ поставщик»: название орг.* · категория строки (read-only) · сайт · почта орг. +
      блок менеджера (Фамилия* · Имя · Отчество · телефон · почта · должность default
      «Менеджер по продажам»); save → org с `categoryIds: [row.categoryId]` + contact,
      строка получает `supplierId` + `supplierContactId`, сайт/почта видны в полосе
- [x] AC5 — panel «+ менеджер» доступна только при выбранном поставщике (`+` и select disabled иначе)
- [x] AC6 — data-test: `supply-quick-supplier-add|-panel|-name|-save|-website|-email|-panel-category`,
      `supply-quick-manager-select|-add|-panel|-last-name|-save`
- [x] AC7 — tsc + supply tests PASS

## Дополнительно (следствия из TZ)

- [x] Одновременно открыта только одна панель (категория / материал / поставщик / менеджер)
- [x] Смена категории сбрасывает поставщика и менеджера, если поставщик не обслуживает новую категорию
- [x] Смена поставщика: авто-выбор менеджера, если у поставщика он единственный, иначе `—`
- [x] `applyLiveCategories` перекладывает и `supplier.categoryIds` на живые id `/categories`
- [x] Seed: `sc-kuban-1` на qo-1, `sc-profrezi-1` на qo-3/qo-4; qo-2/qo-5 без поставщика

## Gates

```text
cd frontend; pnpm exec tsc -p tsconfig.app.json --noEmit          — PASS
cd frontend; pnpm test -- supply --passWithNoTests                — PASS (3 suites / 20 tests)
cd frontend; pnpm exec eslint <3 changed files>                   — PASS
cd frontend; pnpm exec prettier --write <3 changed files>          — applied
```

## Files changed

- `frontend/src/app/pages/supply/supply-quick-order.mock.ts` — `QuickOrderSupplier.categoryIds/email`,
  `QuickOrderSupplierContact`, `MOCK_SUPPLIER_CONTACTS`, `suppliersForCategory`,
  `contactsForSupplier`, `contactLabel`, row `supplierContactId`
- `frontend/src/app/pages/supply/supply-quick-order.component.ts` — полоса «Поставщик»
  (поставщик ▾ · + · менеджер ▾ · + · сайт · ссылка · почта орг.), две панели, взаимное
  исключение панелей, новые ширины полей
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts` — +6 тестов 308

## Known limitation

- Всё ещё mock in-memory: F5 сбрасывает созданных поставщиков и менеджеров (persist — 305).
- «Сайт» и «Почта орг.» в полосе правят **организацию**, а не строку заявки: правка видна во всех
  строках с этим поставщиком. Это соответствует модели 305 (`Organization`), но PO стоит подтвердить.
- Визуальная проверка на 1440px (light + dark) в этой сессии не выполнена — нужен скриншот от PO.
