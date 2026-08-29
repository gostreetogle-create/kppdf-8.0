# Страница: Документ-студия (`DocumentStudio*`)

**Краткое описание:** универсальное рабочее место для **создания и правки экземпляров документов** (не только КП): editable A4-центр, chrome-rails, overlay-панели, слои, таблицы с данными ERP, multipage, save-as-template. **Одна страница редактора** — без navigate на texts/tables/builder.

> **SoT.** Статус: **Waves 0–19 DONE** (2026-08-29).  
> ADR: [`../architecture/document-studio.md`](../architecture/document-studio.md)  
> Программа: [`../../tasks/WAVE-DOC-STUDIO.md`](../../tasks/WAVE-DOC-STUDIO.md)

## Routes

| Route | Роль |
|-------|------|
| `/doc-constructor/studio` | список: **+ Новый**, **Из шаблона**, **Дублировать** |
| `/doc-constructor/studio/:id` | редактор (single-page law) |

`pageKey`: `doc-studio`.

## Rails (actual)

| Rail | Содержимое |
|------|------------|
| L Элементы | + текст / таблица / фото |
| L Слои | z-order, lock, page filter, +/- страницы |
| L Шаблон | save-as-template (name + keep bindings + docTypeId) |
| L Данные | issuer org, counterparty, **КП/заказ** (live ERP) |
| R Свойства | geometry, lock, full-page image, delete |
| R Таблица (tier-L) | manual + ERP live rows → `putDataSet` |

Ribbon: **Редактор | Просмотр** · **PDF** · **В архив** · нумерация страниц.

## API

| Endpoint | Status |
|----------|--------|
| CRUD + blocks + data-sets + preview + pdf + finalize | yes |
| `POST …/from-template` | yes |
| `POST …/:id/duplicate` | yes |
| `POST …/:id/save-as-template` | yes (needs `docTypeId`) |
| **+ Новый → Пустой A4** → finalize | yes (sentinel template «Пустой A4», TZ-DOC-STUDIO-2004) |

## Known limitations

- No Ctrl+Z (ADR § Not in MVP).
- `template_blocks` cutover cleanup (studio-only parent write) — successor wave 20.

## Related

- [`document-studio-data-anchors.md`](../architecture/document-studio-data-anchors.md)
- [`kp-workspace-geometry.md`](./kp-workspace-geometry.md)
