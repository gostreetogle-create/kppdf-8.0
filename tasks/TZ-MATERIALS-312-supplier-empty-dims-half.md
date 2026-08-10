═══════════════════════════════════════════════════════════════
TZ-MATERIALS-312: Supplier empty-state + габариты ½ ширины
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/materials/material-form-dialog.component.ts; frontend/src/app/pages/materials/material-form-dialog.component.spec.ts; docs/pages/materials.page.md; docs/agent-checklists/TZ-MATERIALS-312.md

PAGES: /materials
PAGE_DOCS: materials.page.md

Проверено: supplier = OrganizationsService.list({ type: 'supplier' }); empty → только «— не указан —»; suppliersError/Loading не в template; Габариты section вне 2-col → full dialog width.

Loose wording: «поставщик» в материале = **Organization type=supplier**, не Counterparty.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Empty / error supplier
  - Если list пуст и не loading: hint RU «Нет поставщиков — создайте организацию с типом Поставщик» + ссылка/кнопка на `/organizations` (или актуальный route списка org).
  - Если `suppliersError`: показать текст ошибки под селектом (не маскировать пустым dropdown).
  - Loading: disable select или skeleton short.

ШАГ 2: Габариты layout
  - Секцию «Габариты» ограничить **~½ ширины** диалога на lg+ (`max-w-xl` / `lg:w-1/2` / колонка grid), не растягивать row на всю 1120.
  - Ряды type/value/immutable остаются читаемыми; icon buttons не обрезать.
  - Mobile: полная ширина ok.

ШАГ 3: Spec smoke + page doc note.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- DIMENSIONS contract / isImmutable BE (MATERIALS-305/309)
- Перенос supplier на Counterparty
- Kind dictionary (DICT-319+)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Пустой список поставщиков → видимый RU hint + путь создать.
2. Ошибка загрузки поставщиков видна в UI.
3. На desktop ширина блока Габариты ≈ половина dialog body (visual), не full-bleed row.
4. Gates: frontend tsc; jest material-form если есть; archive + report.
