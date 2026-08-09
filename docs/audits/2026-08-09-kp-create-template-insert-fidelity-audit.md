# Аудит: вставка шаблона в «Создать КП»

**Дата:** 2026-08-09  
**Route:** `/proposals/create`  
**Симптом PO:** шаблон вставляется «коряво» — нет позиционирования текстов, нет таблиц, нет фонового рисунка; видны лишние надписи («шаблон» / имя / «упрощённое превью»). Ожидание: **чистый лист как в конструкторе** — тексты, таблицы, фоны; без служебного chrome и без чужой «личной» мета-информации на листе.

---

## 1. Вердикт (30 сек)

**Вставка шаблона в Create КП сейчас не рендерит шаблон.** Центр показывает карточку метаданных + optional список `draftLines`. Настоящий HTML (фоны, `layout` absolute, table-template preview) уже есть на бэке — `POST /api/document-templates/:id/build` — но Create КП **его не вызывает**.

Это не баг позиционирования в builder и не «сломанный» фон на диске. Это **намеренный stub** после SALES-316/317 (`known_limitation`: упрощённый center).

---

## 2. Что видит менеджер vs что сохранено

| В конструкторе (SoT визуала) | В Create КП сейчас |
|------------------------------|--------------------|
| Background layer(s) + opacity | Нет (фон не запрашивается) |
| Блоки с `layout` (x/y/w/h) | Нет |
| Table-блоки → HTML из table-template | Нет |
| Literal / bound тексты | Нет; вместо этого **имя шаблона** + description + подпись «Превью A4 (упрощённое)» |
| Изделия в КП | Список `productName · qty × price` **поверх** «превью», не из блоков шаблона |

Источник stub:

```31:44:frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts
            <h3 ...>{{ selected()!.name }}</h3>
            ...
              Превью A4 (упрощённое). Смена и правка шаблона — в левой панели.
            ...
                <li>{{ line.productName }} · {{ line.quantity }} × {{ line.unitPrice }} ₽</li>
```

Пикер (`proposal-create-template-picker`) только выбирает `DocumentTemplate` и кладёт в `selectedTemplate` — без `build()`.

---

## 3. Как «правильно» уже умеет бэкенд

`DocumentTemplateService.build(id, dto)`:

1. `findExpanded` — шаблон + блоки  
2. `resolveSourceIds(dto)` — org/cp/product…  
3. `applyIssuerOrganization` — если org не передан, подставляет org шаблона / `isOurCompany`  
4. `resolveBlockContent` + **`resolveTableBlock`** → `TableTemplateService.preview(tableTemplateId)`  
5. `renderHtml` — CSS страницы, `.doc-bg img`, `.block--positioned` из `layout`, table HTML

Контракт FE уже есть: `DocumentTemplatesService.build(id, payload)` → `SilentResult<string>` (text/html).

E2E: `backend/test/e2e/document-templates-build.e2e-spec.ts` — empty body → пустые `{{placeholders}}`; literal/static binding / multi-col — ок.

**Не использовать** legacy `GET :id/preview` как SoT для студии: он **не** проходит `resolveTableBlock` / dataBinding resolve так же, как `build`.

---

## 4. Почему PO видит «надпись шаблоны / имя»

1. **Chrome на листе** — имя шаблона + helper-текст (не контент бланка).  
2. Возможно путаница с кнопкой «← Шаблоны» в **builder** (другой экран) — на Create КП такой кнопки нет; на листе есть `h3` с `name`.  
3. Список товаров как bullet — выглядит как «левый» контент, не как таблица шаблона.

«Личная информация» в смысле PO: **не метаданные реестра и не черновые строки витрины на бланке**. Чистый бланк = то, что нарисовали в конструкторе. Подстановка org/клиента — только из **Параметры** (и штатный issuer fallback `build`, как у печати), не из имени шаблона и не из `draftLines`-stub.

---

## 5. Целевое поведение (продукт)

1. Выбрал шаблон → center = **scaled iframe / sandboxed HTML** из `build(templateId, sourceIds)`.  
2. На листе **нет**: названия шаблона, description, «упрощённое превью», bullet `draftLines`.  
3. Есть: default background, позиционированные тексты/картинки, таблицы (структура/sample из table-template preview).  
4. `sourceIds`: `organizationId` из inspector, если выбран; иначе `{}` (issuer fallback бэка — ок для бланка нашей фирмы). **Не** подставлять выдуманного клиента/изделия.  
5. Смена шаблона или org в Параметрах → пересобрать HTML.  
6. Пустой center без выбора — по-прежнему CTA «Добавить шаблон».  
7. Loading / error на листе — короткие RU, без тостов-спама.  
8. Shell SALES-317 (rails / overlay / A4 fit) **не ломать**.

---

## 6. Риски / границы

| Риск | Решение в TZ |
|------|----------------|
| SALES-317 ещё в `_active` на тех же keys | **319 стартует после archive 317** (или DEFER) |
| `applyIssuerOrganization` может показать реквизиты фирмы | Ожидаемо для бланка; клиент — только после выбора Counterparty (later) |
| iframe + `/uploads/...` фоны | sandbox + same-origin / absolute URL к API origin; проверить что img грузятся |
| Builder canvas ≠ bit-identical `build` HTML | SoT для Create КП = **build HTML** (путь печати), не drag-handles editor |
| Изделия в таблице КП | Не в этой TZ: `draftLines` остаются в rail; bind products → table — successor |

---

## 7. Successor map

| ID | Что |
|----|-----|
| **TZ-SALES-319** | WYSIWYG insert: center ← `build()` HTML, без chrome |
| TZ-SALES-318 | cascade категорий (не блокирует 319) |
| later | bind draftLines / quotation lines в table blocks; Counterparty fill |
| TZ-SALES-320 | печать PARK |

---

## 8. Файлы (read-only аудит)

- `frontend/.../proposal-create-template-center.component.ts` — stub  
- `frontend/.../proposal-create.page.ts` — `selectedTemplate` signal only  
- `frontend/.../pi-document-templates.service.ts` — `build()` ready  
- `backend/.../document-template.service.ts` — `build` / `renderHtml` / `resolveTableBlock`  
- Spec: `docs/ux/kp-create-studio-spec.md` §6 «richer preview later» → закрывает **319**
