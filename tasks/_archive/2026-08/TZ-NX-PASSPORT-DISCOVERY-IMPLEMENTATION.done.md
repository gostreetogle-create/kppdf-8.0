# TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION — DONE

## Outcome

**PASS** — минимальный read-only паспорт изделия в NX на основе `data/Pasports.xlsx` и подтверждённых backend-полей `Product` / composition / Units. Без изменений API и схемы.

## Источники

- `data/Pasports.xlsx` — листы `pasports`, `Products`, `Лист6` (состав: Поз./Обозначение/Наименование/Материал/Кол-во)
- `Product`, `ProductModule`, `Material`, `ProductPassport` schemas (read-only reference)
- `tasks/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md` — live catalog vs snapshot canon

## Реализовано

1. **`PRODUCT_PASSPORT_FIELD_MAP`** — 20 полей из XLSX с меткой `live-product` | `live-derived` | `snapshot-only`
2. **`buildProductPassportPreview()`** — подстановка из Product, Units, composition tree; пустые → «Не указано»
3. **`ProductPassportPreviewComponent`** — read-only блок в `ProductFormDialogComponent` (edit mode)
4. **Разделение live / snapshot** — баннер + метка «(снимок)» на полях только из `ProductPassport`
5. **Состав** — таблица верхнего уровня дерева; `Обозначение` честно «Не указано» (нет `sourceCode` на tree node)

## Backend blockers (не реализованы в этой задаче)

| XLSX | Причина |
|------|---------|
| Паспорт№, Дата, Гарантийный Талон, Номер Изделия, Поставщик | Только `ProductPassport`, нет read в NX |
| Фото (превью URL) | `photoIds` без URL в текущем data-access |
| Цвет (человекочитаемый RAL) | Только `ralCode` slug; нет ColorReference lookup в NX |

→ Черновик backend TZ: `tasks/TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.md`

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/passport/
  passport-preview.types.ts
  passport-field-map.ts (+ spec)
  build-product-passport-preview.ts (+ spec)
  product-passport-preview.component.ts (+ spec)

frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/
  product-form-dialog.component.ts (+ spec)

tasks/TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.md
docs/agent-checklists/TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.md
```

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** (214 tests)
- `pnpm exec nx run-many -t lint --all`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (248 files)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
