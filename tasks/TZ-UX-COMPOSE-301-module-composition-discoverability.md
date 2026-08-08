═══════════════════════════════════════════════════════════════
TZ-UX-COMPOSE-301: Module composition discoverability
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-CATALOG-UX-C #1 (P0 PO)
DEPENDS ON: нет (DEDUP-301/302 DONE; SELECT-301 DONE)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-UX-COMPOSE-301.md
PAGES: /modules/:id ; composition picker dialog
PAGE_DOCS: module-detail.page.md ; product-detail.page.md ; ui-add-and-continue.md

РОЛЬ АГЕНТА: Frontend UI Engineer

CONFLICT KEYS:
frontend/src/app/pages/products/product-composition-picker-dialog.component.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.spec.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.spec.ts;
frontend/src/app/pages/modules/module-form-dialog.component.ts;
frontend/src/app/pages/modules/module-form-dialog.component.spec.ts;
docs/pages/module-detail.page.md;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-UX-COMPOSE-301.md;

Проверено: module-form-dialog = passport only, width lg (~640);
  product-form has composition-hint (DEDUP-301); ModuleMaterials удалён (DEDUP-302);
  picker restrictToModule tabs Модуль|Материал, default activeKind='module';
  bom canAddInto module-root: only when selected node.kind==='module'.

---

## Канон включённости (PO · не менять модель без TZ)

| Родитель | Можно добавить в состав |
|----------|-------------------------|
| **Модуль** | модуль **или** материал |
| **Изделие** | изделие **или** модуль (**и** материал/«деталь» — уже в UI; не убирать) |

Состав пишется **только** через BomPanel на карточке / QC L — не вторым редактором в форме.

## ИСХОДНОЕ

1. «Редактировать» модуль → Form без состава → PO ищет материал в форме и не находит.
2. Пикер модуля открывается на вкладке **Модуль** → select выглядит «только модули».
3. Выбрана строка-материал → «+ Из каталога» скрыта (`canAddInto`).

## ЧТО ДЕЛАТЬ

ШАГ 1: Hint в ModuleForm (как у product)

1. Секция «Состав» с `data-test="composition-hint"`:
   «Состав (модули и материалы) собирается на карточке модуля или в быстром создании (профиль L).»
2. Не возвращать ModuleMaterials / второй write-path.

ШАГ 2: Picker default для модуля

1. `restrictToModule` → начальный `activeKind = 'material'` (вкладка «Материал» первая по смыслу цеха; вкладка «Модуль» остаётся).
2. Обе вкладки видимы; overflow-select `searchable="auto"` без регресса.
3. Копирайт title/лейблов: ясно «модуль или материал».

ШАГ 3: BomPanel — добавить всегда достижимо

1. Пока выбран материал (или любой leaf), кнопка **«+ В корень модуля»** остаётся видимой
   (или эквивалент «добавить в корень»), чтобы не тупик.
2. «+ Из каталога» в выбранный **модуль**-узел — без изменения правил product→product/module.

ШАГ 4: Docs + tests

1. `module-detail.page.md` + строка в `product-detail.page.md`: матрица включённости выше.
2. Jest: default tab material при restrictToModule; module-form hint; root-add visible when material selected.

## НЕ ИЗМЕНЯТЬ

- Backend composition API / schema
- Возврат ModuleMaterialsFormDialog
- product BomPanel write rules (кроме shared picker default / root-add UX)
- desktop, supply, material-detail A+ (CATALOG-337), FACT-304 keys если peer жив на тех же файлах → DEFER
- deploy

## КРИТЕРИИ ПРИЁМКИ

1. ModuleForm показывает composition-hint (не пустой поиск «где материал»).
2. Пикер с `restrictToModule` открывается на **Материал**; вкладка Модуль доступна.
3. С выбранным материалом в дереве можно добавить в **корень** без сброса сессии наугад.
4. Gates:
   ```text
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- product-composition-picker|product-bom-panel|module-form-dialog
   ```
5. Archive + checklist + progress; commit/push own files; deploy NO.
