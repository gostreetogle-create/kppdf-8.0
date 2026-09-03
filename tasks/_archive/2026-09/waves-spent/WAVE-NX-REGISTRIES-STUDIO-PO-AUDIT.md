# WAVE — Реестры + Студия документов (PO browser audit 2026-08-30)

> **Cursor Mode A — orchestration only.** Исполнение: Freebuff #1 (frontend-nx), по одной active TZ, `nx build` green между волнами.  
> Канон: `docs/architecture/MASTER-CORE.md`, `docs/PO-CANON.md`, `docs/pages/registries.page.md`, `docs/architecture/nx-doc-studio.md`.

## PO verdict (живой сайт)

**Реестры — не готовы к показу.** Состав/BOM, формы изделий/модулей/деталей, комплексы, русские ошибки — ломают сценарий оператора.

**Студия — S3 skeleton.** Лист есть, текстовые блоки минимальны; нет legacy-уровня (рамка, snap, rich-text, страницы, polish).

---

## Доменная иерархия (не обсуждается)

```
Изделие (Product) ── isComplex? → «Комплекс» (не отдельный реестр)
    └── Модуль (ProductModule)
            └── строки состава: Материал | Деталь (Material kind=part) | вложенный Модуль | …
Деталь (Material kind=part) ── BOM из материалов (сырьё)
Материал (Material kind=raw/…) ── склад, без вложенного состава изделия
Паспорт изделия (ProductPassport) ── отдельная сущность, НЕ секция формы изделия
```

---

## ФАЗА A — Реестры (6 TZ, строго по порядку)

| # | TZ-ID | Что чинит (PO) | Ключевые файлы |
|---|--------|----------------|----------------|
| A1 | `TZ-NX-REGISTRY-PRODUCT-FORM-UX` | Секция «Паспорт изделия» → «Изделие»; убрать `pi-product-passport-preview` из product dialog; чекбокс **Комплекс** (`isComplex`); описание+заметки в одну строку (2 col) | `product-form-dialog.component.ts` |
| A2 | `TZ-NX-COMPOSITION-ERROR-I18N` | Все ошибки состава на **русском** (`extractErrorMessage` + маппинг 500/Internal Server Error); toast + banner | `composition-panel.component.ts`, `libs/util-http/**` |
| A3 | `TZ-NX-COMPOSITION-PICKER-PARITY` | Picker: добавить **Деталь**, **Материал**, **Модуль**; nested add в модуль/изделие; исправить Internal Server Error root cause (API payload/entityId) | `composition-picker-dialog.component.ts`, `composition-panel.component.ts` |
| A4 | `TZ-NX-DETAIL-MATERIAL-BOM` | Реестр «Детали»: форма + picker **материалов** (из реестра материалов), не только габариты | `material-form-dialog.component.ts`, `details.registry.ts`, backend composition lines |
| A5 | `TZ-NX-PRODUCT-COMPLEX-COMPOSITION` | Комплекс: UI «включает несколько изделий» — composition lines тип product/module; badge в таблице + фильтр | `products.registry.ts`, `composition-tree` |
| A6 | `TZ-NX-REGISTRIES-BROWSER-MATRIX-2` | Полный обход «реестр × 12» + скриншоты; evidence `TZ-NX-REGISTRIES-BROWSER-MATRIX-2/` | all registries |

**Gate каждой TZ:** `nx build kppdf-web` exit 0 последним; одна active; registries/** не смешивать со studio/**.

---

## ФАЗА B — Студия документов (после A6)

| # | TZ-ID | Что даёт PO |
|---|--------|-------------|
| B1 | `TZ-NX-DOCSTUDIO-S4-TYPOGRAPHY` | Плавающий toolbar шрифт/размер/цвет; D1 BlockStyle до PDF |
| B2 | `TZ-NX-DOCSTUDIO-S5-PAGES` | Страницы, книжная/альбомная per-page, редактор страниц |
| B3 | `TZ-NX-DOCSTUDIO-S3-POLISH` | Legacy port: snap к краям, resize frame, layers UX, rich-text (TipTap `@kppdf/ui/rich-text`) |

**Reuse legacy (read-only reference):** `frontend/src/app/pages/doc-constructor/studio/` — не копировать файлом, портировать поведение в NX.

---

## Чек-лист исправления реестров (acceptance PO)

### Изделия
- [ ] Создание: только поля изделия, **без** превью паспорта
- [ ] После сохранения — блок «Состав», не раньше
- [ ] Подсказка: комплекс настраивается в «Состав» (добавление изделий) — см. A5
- [ ] Комплекс: можно добавить несколько позиций (изделия/модули) в состав

### Модули
- [ ] Состав открывается без EN-ошибок
- [ ] «Добавить» → picker с типами: модуль / деталь / материал
- [ ] Ошибки API — русский текст, понятная причина

### Детали
- [ ] Выбор **материала** из справочника (dropdown/search)
- [ ] Габариты + описание компактно (UX-FORM плотность)

### Материалы
- [ ] Без лишнего «состава изделия» в форме сырья

### Общее
- [ ] Весь UI русский (labels, errors, empty states)
- [ ] Паспорт — только реестр `product-passports`, открытие отдельно (не fullscreen в форме изделия)

---

## Чек-лист студии (acceptance PO)

- [ ] Текст: редактирование in-place, рамка выделения, drag, resize
- [ ] Snap к краям листа (legacy parity)
- [ ] Слои: z-order, lock, hide — работают и видны
- [ ] Книжная/альбомная — как S2, не ломается при блоках
- [ ] Страницы: добавить/удалить, переключить (S5)
- [ ] Внешний вид = UI Kit, не «накидано»

---

## Промпт Freebuff #1 (старт A1)

```text
Executor kppdf-8.0 · TZ-NX-REGISTRY-PRODUCT-FORM-UX

1) git fetch && merge origin/main
2) tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md § A1
3) Напиши tasks/TZ-NX-REGISTRY-PRODUCT-FORM-UX.md по docs/TZ-AUTHORING.md
4) CLAIM → код → nx build last → archive → push

Не трогать studio/**. MASTER-CORE: паспорт ≠ форма изделия.
```

---

## Git (на момент аудита)

- `origin/main`: `b09464a3` (S3) — **запушено**
- Локальный WIP (MASTER-CORE, auth, constructor delete) — **не смешивать** с волнами A/B
