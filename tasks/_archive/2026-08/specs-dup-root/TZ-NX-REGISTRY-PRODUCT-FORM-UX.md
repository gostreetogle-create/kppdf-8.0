# TZ-NX-REGISTRY-PRODUCT-FORM-UX

| Поле | Значение |
|------|----------|
| **ID** | TZ-NX-REGISTRY-PRODUCT-FORM-UX |
| **Wave** | A1 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md` |
| **Executor** | Freebuff #1 (frontend-nx) |
| **Conflict keys** | `registries/product-form`, `product-form-dialog`, `isComplex` |
| **PAGES** | registries |
| **PAGE_DOCS** | `docs/pages/registries.page.md` |

## ИСХОДНОЕ

PO (2026-08-30, живой браузер): форма «+ изделие» вводит в заблуждение — секция **«Паспорт изделия»**, fullscreen **превью паспорта** внутри формы изделия, нет флага **Комплекс**, описание/заметки занимают лишнюю высоту.

**Проверено:**
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts` (L85–137)
- `docs/architecture/MASTER-CORE.md` — Product ≠ ProductPassport; `isComplex` на Product
- `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md` § A1

## ЧТО ДЕЛАТЬ

### 1. Переименовать секцию формы
- `app-pi-form-section title="Паспорт изделия"` → **`title="Изделие"`** (headingId `product-main`).

### 2. Убрать превью паспорта из диалога изделия
- Удалить блок `@if (mode() === 'edit' …) { pi-product-passport-preview … }` из template.
- Убрать import `ProductPassportPreviewComponent` из imports массива.
- Паспорт остаётся доступен только через реестр **Паспорта изделий** / отдельный flow (не в этой TZ).

### 3. Комплекс (не чекбокс)
- **`isComplex` — derived** на backend (`composition.some(line => lineType === 'product')`), не поле формы.
- В форме create **не** добавлять чекбокс; под hint «Сохраните изделие…» одна строка: *«Комплекс — когда в состав входят другие изделия (настраивается в блоке «Состав» после сохранения)»*.
- Badge «Комплекс» в таблице уже есть (`formatComplexBadge`) — полная логика добавления изделий в состав → **A5**.

### 4. Плотность формы
- **Описание** и **Заметки** — одна строка на md+: `grid md:grid-cols-2 gap-form-field`, каждое поле `rows="2"`.

### 5. Тесты
- Обновить/добавить spec: секция `data-test="product-form"` без `pi-product-passport-preview`; hint «Сохраните изделие…» на create; isComplex сохраняется (mock service).

## НЕ ДЕЛАТЬ

- Не менять `composition-panel`, picker, backend composition API (→ A3/A5).
- Не трогать `studio/**`.
- Не добавлять новый реестр «Комплексы» — только флаг `isComplex` на Product.
- Не реализовывать открытие паспорта из формы (отдельная задача/реестр).

## ACCEPTANCE CRITERIA

1. Диалог create/edit: заголовок секции **«Изделие»**, нет текста «Паспорт изделия» в форме.
2. В форме изделия **нет** компонента превью паспорта (grep `product-passport-preview` в product-form-dialog = 0).
3. Подсказка про **Комплекс** (derived, не чекбокс); badge в таблице без изменений в этой TZ.
4. Описание + Заметки на широком экране в 2 колонки.
5. `nx build kppdf-web` exit 0; `nx test kppdf-web --testPathPattern=product-form` green (или focused spec).

## CLAIM

```yaml
agent_id: gemini
claimed_at: 2026-08-30T14:22:00+03:00
branch: main
```

## ARCHIVE

`tasks/_archive/2026-08/TZ-NX-REGISTRY-PRODUCT-FORM-UX.done.md`
