# Создать КП — layout spec (WAVE-KP-VITRINE)

**Route:** `/proposals/create`  
**Chrome:** `PiGroupWorkspace` — Сделки TOC **КП** + жёлтые **Создать КП** | **Все КП** (SALES-310)  
**Канон потока:** D13 / D21 в [`sales-to-shop-flow-canon.md`](../audits/2026-08-08-sales-to-shop-flow-canon.md)  
**Обновлено:** 2026-08-09 · **v2 focus shell** (аудит → **TZ-SALES-317**)  
**Утверждение:** этот файл — SoT раскладки; v1 «always-on 3 columns» (SALES-311/312) **superseded** для desktop поведения.  
**Аудит:** [`2026-08-09-kp-create-studio-layout-audit.md`](../audits/2026-08-09-kp-create-studio-layout-audit.md)

---

## 1. Цель (30 сек)

Один экран **студии** сборки КП. Менеджер в первую очередь видит **лист A4 / шаблон** по центру, максимально высоко под group-chrome, **без page-scroll**.

1. **центр** — превью листа A4 (главный фокус),
2. **лево** — узкий icon-rail → раскрывающееся меню товаров (cascade L→R),
3. **право** — узкий icon-rail → параметры сделки (сворачивается вправо; по умолчанию закрыт).

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
| **Left** | icon-rail **~44–52px** | flyout cascade **L→R** (1+ панелей), overlay или dock у рейла | Товары / будущие фильтры; клик вне → свернуть |
| **Center** | всегда | — | Лист A4: `object-fit` в доступный прямоугольник; top-aligned; max без scroll страницы |
| **Right** | icon-rail **~44–52px**, **default collapsed** | панель **← от рейла** | Inspector (org / % / оценка / клиент later) |

### Правила места

1. **Нет** page-local H1 «Создать КП» и zone-titles «Товары / Превью КП / Параметры» (роль = chip + `aria-label`).
2. Studio body: `height: calc(100vh - <groupChrome>)`; `overflow: hidden` на странице студии.
3. Списки товаров / inspector — **внутренний** scroll только внутри flyout, не раздувают center.
4. Default: **оба** rail свёрнуты → центр максимален.
5. При открытии Left — Right остаётся свёрнутым, пока пользователь явно не откроет параметры.
6. Если ширина center (после open panels) < **480px** — принудительно закрыть Right (и при необходимости сузить Left flyout).
7. **Escape** и **pointerdown вне** flyout+rail → закрыть открытые панели.
8. Sticky Deals chrome не перекрывается flyout’ами (flyout ниже chips).

### Cascade (лево) — каркас

```
[📦] → [ Панель 1: разделы/поиск ] → [ Панель 2: изделия + Добавить ]
         (stub категорий ок в 317)      (reuse product-rail list)
```

317: **два уровня визуально** (хотя бы stub L1 + реальный L2 список изделий).  
Глубокие категории/фильтры/иконки-плагины — **TZ-SALES-318+**.

### A4 fit

- Доступный прямоугольник center = studio body минус padding.
- Sheet сохраняет пропорцию **210∶297**; вписывается целиком (`contain`) в прямоугольник.
- Контрол выбора шаблона — **компактная** полоска над sheet (одна строка), без крупных зазоров.
- Пустой state RU: «Выберите шаблон КП» (короче; товары — через rail).

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
| Center template | 316 | compact + A4 fit **317** | richer preview later |
| Print | — | — | **320 PARK** |

---

## 7. Пустые состояния (RU)

| Зона | Текст |
|------|-------|
| Left flyout (нет изделий) | «Выберите изделие — оно попадёт в КП» |
| Center (нет шаблона) | «Выберите шаблон КП» |
| Right | «Укажите нашу фирму (бланк) и наценку» |

---

## 8. Цены и сумма

Без изменений: оценка = подсказка UI; saved total — не обязанность shell.

---

## 9. A11y / Paper & Ink

- Icon-only rail buttons: обязательный `aria-label` («Товары», «Параметры») + `aria-expanded`.
- Focus ring `pi-focus-ring`; Tab порядок: left rail → center → right rail → open flyout.
- Escape закрывает flyout.
- Контраст light/dark; без декоративных карточных теней.

---

## 10. Вне scope

- Печать / batch (320).
- Встроенный document builder.
- Schema rewrite семьи / convert.
- ModuleMaterials.
- Полный category tree / фильтры витрины (318+).

---

## 11. Checklist исполнителя 317

- [ ] Нет H1 «Создать КП» и zone h2 в студии.
- [ ] Default: оба rail свёрнуты; A4 влезает в viewport без document scroll.
- [ ] Left/Right icon-rail; expand + click-outside + Escape.
- [ ] Left показывает cascade каркас (≥2 уровня stub/reuse).
- [ ] Right default closed; existing inspector внутри flyout.
- [ ] Deals TOC + yellow chips сохранены.
- [ ] Jest + tsc зоны зелёные.
