# WAVE-DOC-TABLES — Таблицы документов: chrome + поля + дизайн

**STATUS:** DONE #1–#4; **305 READY** (dialog compact + fields multi)
**SoT:** `D:\kppdf-8.0` на `main`  
**Промпт 305:** [`../prompts/TZ-DOC-TABLES-305-PROMPT.md`](../prompts/TZ-DOC-TABLES-305-PROMPT.md) · wave: [`PROMPT-CONTINUOUS.md`](./PROMPT-CONTINUOUS.md)  
**Deploy:** только по команде PO

## Зачем (PO)

На `/doc-constructor/tables`: два ряда крошек как у Сделок; выпадающие списки по дизайну; поля источника (Продукция) неполные / нет фото; хочется, чтобы поля **подтягивались сами**, а не вручную в реестре.

## Lock UI

| Ряд | Chip |
|-----|------|
| TOC тёмный (весь раздел Документы) | Шаблоны · Архив · Тексты · **Таблицы** |
| Жёлтый (только под Таблицы) | **Все таблицы** · **Из данных** |

- **Все таблицы** — список шаблонов таблиц (как сейчас list).  
- **Из данных** — сценарий «из существующих данных» (from-registry).  
Ручная «пустая» новая таблица — CTA на «Все таблицы» (не отдельный chip), чтобы не плодить третью кнопку.

## Порядок

| # | TZ | После | Статус |
|---|-----|--------|--------|
| 1 | **TZ-DOC-TABLES-301** Documents TOC dark + Tables yellow chips | — | DONE |
| 2 | **TZ-DOC-TABLES-302** dialog: overflow-select + плотный UX полей | 301 желательно; keys разные → || ok | DONE |
| 3 | **TZ-DOC-TABLES-303** registry: product (+ др.) поля по schema SoT + фото-слот | — | DONE |
| 4 | **TZ-DOC-TABLES-304** auto-sync registry ← mongoose schema | **после 303**; большой | DONE |
| 5 | **TZ-DOC-TABLES-305** dialog compact + category select + fields multi-overflow | после 302 | **READY** |
| 6 | **TZ-DOC-TABLES-307** category `kp` + seed КП-preset + apply-preset | после 305 visual желательно | **READY** → см. `../kp-vitrine/WAVE-KP-TABLE-CONFIG.md` |

## Честный север по «автополям»

Теперь поля Product строятся из `ProductSchema.paths` с явным deny-list и label/type policy; entity sources остаются allowlist.
**303** закрыл полезные поля и photo slot; **304** убрал ручное дублирование полей, чтобы новые scalar `@Prop` не забывались в registry.

## BAN

- EAV «поля из воздуха» без schema  
- ModuleMaterials  
- deploy без PO  
- ломать texts data-field-picker без нужды (reuse patterns ok)
