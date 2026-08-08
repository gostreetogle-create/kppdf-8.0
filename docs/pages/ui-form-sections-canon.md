# UI Form Sections Canon (секции формы)

> Единый стиль блоков внутри диалогов.  
> **Эталон визуала:** «Создать материал» — `material-form-dialog.component.ts`  
> (Основные данные · Дополнительно · Габариты).  
> Оболочка окна: [`ui-dialog-canon.md`](./ui-dialog-canon.md).  
> Ёмкость полей: [`ui-form-field-capacity.md`](./ui-form-field-capacity.md).  
> Аудит L-паспорта: [`../audits/2026-08-08-quickcreate-L-full-passport.md`](../audits/2026-08-08-quickcreate-L-full-passport.md).

## Зачем

PO: материал уже «по полочкам»; изделие QuickCreate и прочие окна должны выглядеть **так же**, не каждый диалог своим воздухом.

## Эталон разметки (Material)

Секция:

- `<section class="space-y-form-field rounded-sm bg-paper-2/40 p-3 border-l-[3px] border-l-gold">`
- Заголовок: `<p class="eyebrow text-ink">…</p>` + `aria-labelledby`
- Внутри — grid полей (с учётом field capacity)

Типичные названия групп (RU):

| Группа | Когда |
|--------|--------|
| Основные данные | имя, вид, ед., артикул, обязательное |
| Дополнительно | описание, заметки, поставщик, фото |
| Габариты | Д/Ш/В, вес, ед. габаритов |
| Состав | только где есть BOM (изделие L / карточка) |

Не плодить синонимы («База» / «Главное») без нужды — сначала эти три (+ Состав).

## Правила для агентов

1. Новый/правимый form-dialog → секции как Material, не плоский список.
2. Сначала **вынести общий примитив** (напр. `PiFormSection` / shared class tokens), потом гнать sweep — иначе копипаста классов разъедется.
3. Kind A (confirm) — без секций.
4. QuickCreate S — можно без секций или одна «Основные»; M/L — секции обязательны.
5. Sweep всех окон — отдельный TZ после эталона на Material + QuickCreate product L.

## Очередь

| TZ | Что |
|----|-----|
| FORM-302 | примитив секции + QuickCreate product/module по эталону Material |
| FORM-303 | фото в L (reuse FullEditor upload) |
| FORM-304 | состав в L (reuse ProductBomPanel) |
| FORM-305 | sweep: пройти form-dialogs → тот же стиль секций |
