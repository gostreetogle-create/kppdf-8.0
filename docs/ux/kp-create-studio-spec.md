# Создать КП — layout spec (WAVE-KP-VITRINE)

**Route:** `/proposals/create`  
**Chrome:** `PiGroupWorkspace` — Сделки TOC **КП** + жёлтые **Создать КП** | **Все КП** (SALES-310)  
**Канон потока:** D13 / D21 в [`sales-to-shop-flow-canon.md`](../audits/2026-08-08-sales-to-shop-flow-canon.md)  
**Обновлено:** 2026-08-09 · **v2.1 overlay RMK**  
**LOCK (PO PASS visual):** каркас ниже **не ломать** без нового TZ + явного PO.  
**Утверждение:** SoT раскладки; v1 always-on columns и docked-resize — superseded.  
**Аудит:** [`2026-08-09-kp-create-studio-layout-audit.md`](../audits/2026-08-09-kp-create-studio-layout-audit.md) · [`overlay-correction`](../audits/2026-08-09-kp-create-studio-overlay-correction.md)

---

## 0. FROZEN — что нельзя «улучшать» молча

1. **A4 center** — главная площадь; open меню **не** меняет ширину/высоту листа (только overlay).
2. Left rail: Шаблон · Товары · Получатель. Right: Параметры · Редактор таблицы · Условия (+ **Вывод** после TZ-SALES-367); overlay, не меняют A4 geometry.
3. Нет page H1 / zone-titles / dropdown шаблона над листом.
4. Под жёлтыми chips **нет** пустой tools-полосы; studio `flushBody` вплотную к chips.
5. **Нет** горизонтальной savebar/toolbar **над** A4 в center (статус / версии / заказ / копировать / «Сохранено» / Скачать-полоса). Lifecycle — на `/proposals`. Вывод (Печать·PDF·Архив) — только icon-rail overlay. Канон: [`2026-08-12-kp-create-no-savebar-canon.md`](../audits/2026-08-12-kp-create-no-savebar-canon.md).
6. Любой откат к docked 3-колонкам / «одна кнопка → две панели» / возврат savebar над листом — **regression**.

---

## 1. Цель (30 сек)

Один экран **студии** сборки КП. Менеджер в первую очередь видит **лист A4 / шаблон** по центру, максимально высоко под group-chrome, **без page-scroll**.

1. **центр** — превью листа A4 (главный фокус; **размер не меняется** при открытии меню),
2. **лево** — icon-rail с **двумя** кнопками (Шаблон · Товары) → overlay-меню поверх center,
3. **право** — icon-rail → параметры (overlay; по умолчанию закрыт).

Содержание одно; **бланк = Organization**; **клиент = Counterparty**. Скидки/наценка в КП. Сумма = **подсказка** («оценка»).

---

## 2. Словарь UI ↔ код

| UI (RU)            | Код / API                                           |
| ------------------ | --------------------------------------------------- |
| Создать КП         | route `/proposals/create` + жёлтый chip (без дубля H1) |
| Все КП             | route `/proposals`                                  |
| КП / Quotation     | сущность `Quotation` (не переименовывать коллекцию) |
| Наша фирма / бланк | `Organization`                                      |
| Клиент             | `Counterparty`                                      |
| Изделие            | `Product` (лейбл «Изделие»)                         |

---

## 3. Desktop ≥1280px — focus shell

```
┌─ sticky PiGroupWorkspace (TOC + yellow chips) ──────────────┐
│  КП | Договоры | Заказы     [Создать КП] [Все КП]           │
├────┬───────────────────────────────────────────────────┬────┤
│ L  │              CENTER (flex:1)                      │ R  │
│rail│         A4 sheet — top, fit viewport              │rail│
│48px│         no document scroll                        │48px│
└────┴───────────────────────────────────────────────────┴────┘
```

| Зона | Свёрнуто | Раскрыто | Содержание |
|------|----------|----------|------------|
| **Left rail** | 2 icon-btn **~44–52px** (Шаблон · Товары) | template overlay ≤~20rem; products overlay **36–40rem** поверх center | Пикер шаблона **или** список изделий |
| **Center** | всегда fixed width между rails | — | Лист A4; **не сжимается** при open |
| **Right** | icon-rail, **default collapsed** | overlay ← от рейла | Параметры **или** Таблица |

### Правила места

1. **Нет** page-local H1 и zone-titles.
2. Studio body: `height: calc(100vh - <groupChrome>)`; `overflow: hidden`.
3. Grid колонки **`rail | center | rail` фиксированы** — open/close **не** меняет `grid-template-columns`.
4. Flyout = `position: absolute` поверх center; scroll только внутри flyout.
5. Default: все flyout закрыты.
6. Left tools взаимно исключают друг друга; на узком — ещё и не вместе с Right.
7. **Escape** / pointerdown вне rail+flyout → закрыть (CDK overlay select не считается «вне»); transparent backdrop covers the center/iframe while a flyout is open.
8. Выбрал шаблон → панель шаблона закрывается; товары остаются open для add & continue.
9. Глубокий category cascade L→R — **318**, тоже только overlay (не dock).

### A4 fit

- Прямоугольник center = между двумя rails (не зависит от open flyout).
- Sheet `210∶297` contain, top-aligned.
- Пустой center: **«Добавить шаблон»** → открывает tool Шаблон.
- Пикер и «Редактировать» — только в overlay Шаблон.
- После выбора (**319**): содержимое листа = HTML `DocumentTemplatesService.build` (sandbox iframe), не stub name/description/draftLines; document scroll отключён внутри A4 page box.

---

## 4. Tablet 768–1279px

- Center + оба icon-rail (если ширина позволяет); иначе только center + toggles как сейчас.
- Одновременно открыта **≤1** боковая панель (flyout/sheet).
- Escape / клик вне закрывает.

---

## 5. Mobile <768px

- Center first.
- Bottom sheets для товаров и параметров (те же зоны).
- Не перекрывать TOC/chips.

---

## 6. Зоны ↔ слои

| Зона | v1 | v2 focus shell | Дальше |
|------|----|----------------|--------|
| Shell / chrome declutter / rails | 312 | **317** | — |
| Left cascade + catalog UX | 314 list | stub in **317** | **318** |
| Right inspector fields | 315 | reuse in flyout **317** | Counterparty write later |
| Center template | 316 | compact + A4 fit **317** | **319** `build()` HTML в iframe — DONE path; без chrome имени / draftLines на листе |
| Print | — | — | **320 PARK** |

> **319 + 321:** stub «упрощённое превью» закрыт. Center = sandboxed `DocumentTemplatesService.build` HTML (фон/layout/tables), `/uploads` rewritten to app origin, and intrinsic A4 iframe contain-scaled without sheet scrollbars. Shell §0 FROZEN.

---

## 7. Пустые состояния (RU)

| Зона | Текст |
|------|-------|
| Left flyout (нет изделий) | «Выберите изделие — оно попадёт в КП» |
| Center (нет шаблона) | Кнопка «Добавить шаблон» (открывает left) |
| Right | «Укажите нашу фирму (бланк) и наценку» |

---

## 8. Цены и сумма

Без изменений: оценка = подсказка UI; saved total — не обязанность shell.

---

## 9. A11y / Paper & Ink

- Icon-only rail: `aria-label` **Шаблон** / **Товары** / **Параметры** + `aria-expanded`.
- Focus ring `pi-focus-ring`; Tab: left rail → center → right rail → open flyout.
- Escape закрывает flyout.
- Контраст light/dark; без декоративных карточных теней на overlay (hairline + raised paper).

---

## 10. Вне scope

- Печать / batch (320).
- Встроенный document builder.
- Schema rewrite семьи / convert.
- ModuleMaterials.
- Полный category tree / фильтры витрины (318+ overlay cascade).

---

## 11. Checklist исполнителя 317

- [ ] Нет H1 «Создать КП» и zone h2 в студии.
- [ ] Grid rails|center|rails фиксирован; open flyout **не** меняет ширину A4.
- [ ] Left rail: две кнопки Шаблон + Товары; Right: Параметры; default закрыты.
- [ ] Overlay + Escape / click-outside.
- [ ] CTA «Добавить шаблон»; pick закрывает панель шаблона.
- [ ] Deals TOC + yellow chips сохранены.
- [ ] Jest + tsc зоны зелёные.
