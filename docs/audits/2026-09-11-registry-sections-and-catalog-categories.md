# Аудит: реестры — секции + категории деталей/модулей/изделий

**Дата:** 2026-09-11  
**Триггер:** PO — units в «Каталоге» нелогично; нужны категории деталей/модулей/изделий через реестр + обязательный select при создании.

### Preflight Check Output
- **Context read:** скрин `/registries`; `registries.catalog.ts`; `*.registry.ts` `category:`; `category.schema.ts` (`type: material|product|general`, `parentId`, `skuPrefix`); `material.schema.ts` / `product.schema.ts` (`categoryId`); `product-module.schema.ts` (**нет** categoryId); forms: categoryId = raw ObjectId input; no NX Category registry
- **Key Constraints:** reuse `Category` API; не второй write-path; materialKind ≠ Category
- **Planned Deliverable:** WAVE + TZ pack
- **Validation Path:** FIC A/C при новых registry keys

---

## 1. Секции реестров (сейчас)

| Секция UI | Реестры | Вердикт |
|-----------|---------|---------|
| **Каталог** | units, materials, details, modules, products | **units чужой** → вынести |
| Контрагенты | organizations | OK |
| Финансы | vat-rate | OK |
| Документы | formulas, product-passports, text-blocks, table-templates | OK |
| Цех | work-types, workers | OK (если подключены) |

**Целевое:**
| Секция | Реестры |
|--------|---------|
| Каталог | materials, details, modules, products |
| **Справочники** | **units**, **categories** (новый) |
| остальные | без изменений |

---

## 2. Категории сущностей (факты)

| Сущность | BE categoryId | NX форма | NX реестр категорий |
|----------|---------------|----------|---------------------|
| Material (детали/сырьё) | есть → `Category` | поле «Категория (ID)» ObjectId — **не UX** | **нет** |
| Product | есть | то же ObjectId | **нет** |
| ProductModule | **нет поля** | — | — |

`Category.type`: `material` | `product` | `general` — **нет `module`**.

`materialKind` (part/fastener/purchased) — **другой** контур (технический вид). Категории PO («Метизы», «Покупные») = записи `Category` type=`material`, не замена kind.

---

## 3. Решение (reuse)

1. Один реестр **«Категории»** с колонкой/фильтром **«Категория чего»** = Детали (material) | Изделия (product) | Модули (module — расширить enum).
2. Формы детали/изделия/модуля: **обязательный** select категорий своего type (не ObjectId).
3. Units → секция `Справочники` **внутри** `/registries` (это не top-nav «Справ.»).
4. Сырьё: category select optional (PO 2026-09-11).
5. Top-nav «Справ.» / категории текстов → см. `WAVE-NX-DROP-REFERENCE-NAV`.

---

## 4. WAVE

См. `docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md` + TZ ниже.

## 5. Closeout 01/5 (2026-09-11) — `TZ-NX-REG-UNITS-TO-REFERENCES` DONE

`units.registry.ts`: `category: 'Каталог'` → `'Справочники'`. Целевая карта
секций (см. §1) частично реализована — Каталог = materials/details/modules/products;
Справочники = units (+ будущий `categories`, TZ-02). `docs/pages/registries.page.md`
получил новую секцию «Master-table section grouping» с этой картой.

## 6. Closeout 02/5 (2026-09-11) — `TZ-NX-REG-CATEGORIES-CRUD` DONE

BE: `Category.type` enum `+= 'module'` (schema + `CreateCategoryDto`, `@IsIn`).
NX: `PiCategoriesService` (data-access, list/getById/create/update/remove) +
реестр `categories` (секция «Справочники», рядом с `units`) — колонки
имя/тип(RU)/skuPrefix/родитель/статус; фильтры search+type; toolbar «Создать
категорию»; row edit/delete (delete = существующий BE 409 на детях/ссылках,
без нового client-правила). `CategoryFormDialogComponent`: select типа
(Детали/Изделия/Модули — `general` не в списке создания), select родителя
(фильтр по тому же типу, сбрасывается при смене типа), `skuPrefix`
auto-suggest транслитерацией из name до первого ручного правки; `slug`
никогда не отдельное поле — всегда `skuPrefix.toLowerCase()`.
`registries.catalog.ts` расширен 2 опциональными trailing-параметрами
(`categoriesService`, `categoryDialogHost`) — тот же паттерн, что
work-types/workers. Wiring в material/product/module формы — TZ-03/04/05,
следующие в этой волне.

## 7. Closeout 03/5 (2026-09-11) — `TZ-NX-REG-CATEGORY-WIRE-DETAILS` DONE

`MaterialFormDialogComponent`: `categoryId` — ObjectId text → `<select>` живых
категорий `type=material` (`PiCategoriesService`, только `isActive`).
Обязательна для «деталь» (`isDetailForm()` — то же условие, что уже решает
видимость BOM-панели); для сырья — та же select, не обязательна (PO). Список
«Категория» в details/materials уже показывал имя (BE
`.populate('categoryId')` на `GET /materials` существовал раньше этой TZ) —
не менялся. Фильтр `categoryId` на details/materials registries **оставлен
текстовым** (не превращён в live-select) — платформа реестров (`RegistryFilter`)
не поддерживает async-загруженные опции ни для одного существующего фильтра;
делать это только для одного поля — диспропорциональный scope для этой TZ.
Плейсхолдер фильтра поправлен на «ID из реестра «Категории»» — честная
подсказка, куда за ID идти, вместо голого «MongoDB ObjectId».
