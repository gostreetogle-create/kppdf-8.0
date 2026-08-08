═══════════════════════════════════════════════════════════════
TZ-DICT-313: Аудит — профили быстрых форм (S/M/L) в Справочниках
═══════════════════════════════════════════════════════════════

> READY · **docs audit + канон** · код продукта не трогать  
> Завтра (после COST-304 / рядом в слоте архитектора)  
>
> Триггер PO (2026-08-08 ночь): в одном месте (скорее **Справочники**) —
> настройка «какие поля показывать» для диалогов быстрого создания
> (товар / модуль / …). Выпадающий список сущностей → таблица полей с
> галочками → несколько размеров диалога (маленький / средний / большой).
> На сайте в нужных местах «Добавить товар» открывает **этот** диалог
> только с включёнными полями. Обязательные — всегда on.
>
> Переосмысление (канон формулировки, не стенограмма):
> это **не** «генератор любых таблиц БД», а **профили UI create-форм**
> поверх уже известных сущностей каталога (и позже — других).
> Полная карточка/редактор остаётся; quick-dialog = укороченный create.

STATUS: DONE (docs) → `tasks/_archive/2026-08/TZ-DICT-313.done.md` · successors 314–316

РОЛЬ АГЕНТА: Cursor architect — audit + decision table + wave 314+

ЗАВИСИМОСТИ:
- DICT wave 301–312 DONE (hub IA)
- Живые create-диалоги: `product-form-dialog`, module/material form dialogs
- Аналог org-настроек UI: `catalog-appearance` (kind colors) — **не дублировать
  IA вслепую**; решить: Справочники vs Каталог/Оформление

LAYER: docs (1)

PAGES: `/dictionaries/*` (новая страница настроек); consumers — кнопки «Создать»
  на `/products`, `/modules`, … (только планирование wire)
PAGE_DOCS: `docs/pages/dictionaries.page.md` (или новый page doc); DICT-300

CONFLICT KEYS (docs/TZ only):
docs/audits/2026-08-09-quick-create-form-profiles.md;
tasks/_backlog/dictionaries/TZ-DICT-313-quick-create-form-profiles-audit.md;
tasks/_backlog/dictionaries/TZ-DICT-314-*.md (черновик после решений);
tasks/_backlog/dictionaries/README.md;
docs/agent-checklists/TZ-DICT-313.md;
docs/agent-checklists/_active-map.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/PO-DIARY.md;
docs/agent-handoff-2026-08-09-morning.md;
tasks/TZ-DICT-300.md (ссылка на волну — одна строка);

---

## Domain preflight

| PO сказал | Канон |
|-----------|--------|
| «таблица / выпадающий список таблиц» | **Entity / form target**: `product` \| `module` \| `material` (whitelist), не произвольный SQL |
| «галочки полей» | **Field visibility profile** per `(entity, size)` |
| «маленькая / средняя / большая» | **Size preset**: `S` \| `M` \| `L` (лимит полей + ширина диалога) |
| «обязательные по умолчанию» | Schema/`Validators.required` + business required → **locked on** (галочку снять нельзя) |
| «в справочниках все настройки» | Предпочтительный IA-host = Dictionaries; сверить с `/catalog/appearance` |
| «в нужных местах сайта» | Один shared `QuickCreateDialog` + `profileId`/`entity+size`; не копипаста форм |

Кардинальность:
- 1 Organization → N profiles? или 1 profile matrix per entity×size (org-scoped)
- Unique key: `(organizationId, entity, size)` — одна матрица галочек на размер
- Create API тот же, что full dialog (POST product/module); missing optional = omit

Проверено (подтвердить file:line при аудите):
- `product-form-dialog.component.ts` — тяжёлый full create/edit (name/kind/unit required…)
- `catalog-appearance.page.ts` — org UI settings уже в **Каталоге**, не в DICT
- `docs/audits/2026-08-04-dictionaries-ux-ia-audit.md` + `TZ-DICT-300` — Справочники ≠ каталог сущностей
- PO-DIARY: Виды работ остаются в Каталоге; «настройки в справочниках» — новый smell IA

---

## ИСХОДНОЕ (боль)

1. Full dialog товара/модуля велик → для быстрого create из BOM/списка/заказа лишний шум.
2. Хочет **сам** решить, какие поля в S/M/L, без правки кода.
3. Несколько точек входа «Добавить» → один и тот же настроенный диалог.
4. Риск: выключить обязательное → 400 с API; или «настройка» размазана по Каталогу и Справочникам.

---

## ЧТО ДЕЛАТЬ (аудит, 1 сессия)

### 1. Переосмысление → glossary в audit-доке
Зафиксировать термины: Entity, FieldKey, Size(S/M/L), Profile, LockedRequired,
FullEditor vs QuickCreate.

### 2. Decision table (обязательно выбрать)

| # | Вопрос | Варианты |
|---|--------|----------|
| D1 | Где UI настроек | **(a)** Справочники `/dictionaries/form-profiles` (PO lean); **(b)** Каталог рядом с appearance; **(c)** Admin-only |
| D2 | Scope хранения | **(a)** per Organization; **(b)** global seed only; **(c)** per User (обычно overkill для ~10 чел) |
| D3 | Первые entities P0 | **(a)** product only; **(b)** product+module; **(c)** +material |
| D4 | S/M/L смысл | **(a)** только набор полей; **(b)** поля + ширина диалога (`pi-dialog` size); **(c)** + разная плотность |
| D5 | Required | locked checkbox always on; список required = union(BE DTO required, FE business) |
| D6 | Edit existing | QuickCreate = **create only** P0; edit → full dialog (рекомендация) |
| D7 | Field registry | allowlist в коде (FieldKey → control type/label/validator); галочки не изобретают новые поля |
| D8 | Default profiles | seed S/M/L для product (имя+ед.+kind / +прайс / +категория+описание…) — зафиксировать черновик |

Стартовая рекомендация архитектора:
- D1=a, D2=a, D3=b, D4=b, D5 locked, D6 create-only, D7 allowlist, D8 seed.
- Не EAV произвольных полей (Z-005) — только visibility поверх известных ключей.

### 3. Threats / НЕ
- Не давать снять required → silent broken create
- Не дублировать три независимых form component — один renderer по profile
- Не смешать с composition-tree / cost override
- Не «настройки вообще всего ERP» в одной помойке — только form profiles (+ ссылка на appearance)

### 4. Deliverable
1. `docs/audits/2026-08-09-quick-create-form-profiles.md` — glossary, D1–D8, field allowlist draft (product/module), wire map («где кнопки»), IA screenshot-plan.
2. Черновики successors:
   - **TZ-DICT-314** — BE schema + API profiles + seed
   - **TZ-DICT-315** — FE settings page (entity select + checkbox matrix × S/M/L)
   - **TZ-DICT-316** — QuickCreate dialog + wire 1–2 entry points (products list / BOM)
3. Обновить DICT README + active-map + handoff + PO-DIARY §2 одна строка.
4. Archive 313 как docs-DONE после заполненных D*.

### 5. НЕ делать в 313
Патчи form dialogs / Nest schemas; deploy; EAV; Desktop.

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Audit-док с выбранными D1–D8 (не «на усмотрение»)
- [ ] Явный список FieldKey P0 для product (и module если D3=b)
- [ ] Черновики 314–316 с CONFLICT KEYS и AC
- [ ] IA: одна фраза «почему Справочники, а appearance остаётся в Каталоге» (или перенос)
- [ ] Нет product `*.ts` в коммите 313

known_limitation: до 314–316 на сайте остаются только full dialogs.

---

## Промпт (завтра, Cursor)

```text
Прочитай docs/PO-DIARY.md §1–§4, docs/TZ-AUTHORING.md,
tasks/TZ-DICT-300.md и
tasks/_backlog/dictionaries/TZ-DICT-313-quick-create-form-profiles-audit.md.
Checklist docs/agent-checklists/TZ-DICT-313.md.
Аудит только docs: D1–D8, audit-док, черновики DICT-314…316.
Код не трогай. Commit+push docs.
```
