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

## 8. Closeout 04/5 (2026-09-11) — `TZ-NX-REG-CATEGORY-WIRE-PRODUCTS` DONE

`ProductFormDialogComponent`: тот же паттерн, `categoryId` → `<select>`
`type=product`, **обязателен без исключений** (в отличие от деталей, для
изделий TZ не называл никакого «optional» случая). Найден и исправлен
реальный баг при переносе: `patchProduct()` раньше принимал только
`typeof categoryId === 'string'`, отбрасывая populated-объект целиком — при
редактировании изделия с категорией поле всегда открывалось пустым. Добавлен
локальный `refId()` helper (тот же паттерн, что уже дублирован в
`material-form-dialog.component.ts` и `production-read.facade.ts` — нет
общего util). Legacy `Product.subcategory` (BE schema/DTO, свободная
строка) — не тронут, не показан в форме; TZ явно просил не раздувать его в
«второй SoT», он и не был.

## 9. Closeout 05/5 (2026-09-11) — `TZ-NX-REG-CATEGORY-WIRE-MODULES` DONE — WAVE COMPLETE

`ProductModule` — единственная из трёх сущностей волны без существующего
поля `categoryId`, поэтому здесь не «замена text-input на select», а полное
добавление: BE `product-module.schema.ts` (`categoryId?: Types.ObjectId`,
ref `Category`, indexed), `create-product-module.dto.ts`
(`@IsMongoId({message:'Категория модуля обязательна'})` — тот же idiom без
`@IsOptional()`, что уже использует `article`), `product-module.service.ts`
(новый `assertModuleCategory()`, зеркало `Material`'ного
`loadAssignableMaterialCategory` — проверяет существование + `type=module` +
`isActive`; конструктор получил 4-й позиционный параметр `categoryModel`),
`product-module.module.ts` (регистрация `Category`/`CategorySchema` в
`MongooseModule.forFeature`). `categoryId` сделан **обязательным** без
исключений (как products, не как materials/сырьё) — для модулей PO не
называл никакого «optional» случая, а «модуль без категории» не имеет
доменного смысла (в отличие от сырья).

`findAll()` (оба paginated/list-all branch) и `findById()` теперь
`.populate('categoryId')` — этого не было для модулей раньше (Material и
Product это уже делали до волны). NX: `ModuleFormDialogComponent` получил
select `type=module` (тот же `PiCategoriesService`, `isActive`-only паттерн,
что material/product), `modules.registry.ts` — новая колонка «Категория»
(`formatMaterialRef`, тот же форматтер, что уже использует details/products
для populated-ref). Найден и исправлен побочный баг: 4-й позиционный
параметр конструктора `ProductModuleService` сдвинул все прежние прямые
`new ProductModuleService(...)` вызовы — `grep -rln` нашёл 2 такие точки в
`catalog-314.archive.spec.ts` (несвязанный файл про `remove()`/архивацию),
исправлены добавлением недостающего 4-го аргумента.

Платформенное решение по фильтру `categoryId` на `modules` registry — то же,
что в 03/04: фильтра по категории у `modules` registry нет вообще (только
`search`), так что вопрос live-select vs text не возникает для этой TZ.

**WAVE-NX-REGISTRY-CATEGORIES — все 5 задач DONE.** Итог волны: единая
`Category` (`type: material|product|module|general`) через `/api/categories`
теперь реально используется как категоризация для всех трёх каталожных
сущностей (materials/details, products, modules) — обязательна для
деталей/изделий/модулей, опциональна для сырья; `materialKind` не тронут и
не смешан с `Category` ни в одной задаче; `TextBlockCategory` не тронута.
