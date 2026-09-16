# TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP: из «Выбрано» — сразу к замене

> **SIZE:** S · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Freebuff executor  
> **LAYER:** 3  
> **ЗАВИСИМОСТИ:** не параллелить с ADD-PAGE / NECESSITY на `studio-editor.page.ts`. Можно параллельно PHOTO (resolver) и CATEGORY-INLINE (forms).

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.spec.ts`

**PAGES:** `/studio/:id` — rail «Выбрано» → «Данные»  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` (§Выбрано D56, §Данные TOC)  
**AUDIT:** `docs/audits/2026-09-13-docstudio-selected-replace.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

## Domain preflight

- **Канон:** Клиент/Плательщик/Поставщик = Counterparty via `context` / `anchors`; товары = catalog selections; выбор UI уже в TOC Данные (не invent modal).
- **Проверено:** selected chips anchors без кнопки; catalog только × clear. PO: нужна замена через то же место выбора.
- **Necessity:** да — иначе оператор не знает, что клиент меняется в «Кому», а не в буфере.

## ИСХОДНОЕ

1. `mode === 'selected'`: anchors read-only; catalog `×` → `removeCatalogChip` (сброс, не edit).
2. Пикеры: `whom` (Клиент, Плательщик), `more` (Поставщик), `products` (витрина), `links` (КП/Заказ — если появятся в буфере).
3. Editor уже умеет `onSection('data'|'selected')`; у data-panel есть `activeCategory` signal, но **нет** API «открой категорию X» снаружи.

## ЧТО ДЕЛАТЬ

**ШАГ 1 — Кнопка на чипе.**  
В буфере «Выбрано» у **каждого** anchor-чипа и catalog-чипа: кнопка `Изменить` (`data-test="studio-selected-edit-<key>"`, aria «Изменить {{label}}»).  
× у catalog **оставить** (сброс ≠ замена). Anchors: только Изменить (сброс клиента = выбрать «— не выбран —» в Кому; отдельный × на anchors не обязателен).

**ШАГ 2 — Jump map (reuse, не второй UI).**  
`editSelection.emit(target)` → editor:

| chip key | действие |
|----------|----------|
| `client` | `onSection('data')` + TOC **Кому** + focus `studio-counterparty-select` |
| `payer` | Данные → **Кому** + открыть disclosure плательщика + focus payer select |
| `supplier` | Данные → **Ещё** + focus supplier select |
| `products`/`modules`/`parts`/`materials` | Данные → **Товары** (витрина; kind уже в UI) |
| если позже в буфере КП/заказ | Данные → **Связи** + focus нужного select |

Реализовать через input/method на `pi-studio-data-panel`: например `openCategory(cat)` / `pendingFocusTestId` после section switch. Не дублировать `<select>` в «Выбрано».

**ШАГ 3 — После выбора.**  
Существующий PATCH context / catalog write path. Чип в «Выбрано» обновляется при возврате на rail (не авто-закрывать Данные — оператор сам).

**ШАГ 4 — Specs.**  
- Panel: клик Изменить на client → emit `editSelection` с `client`.  
- Editor (или panel+host): emit → section `data` + `activeCategory === 'whom'`.  
- Аналогично supplier → `more`; products chip → `products`.

## НЕ ИЗМЕНЯТЬ

- Новые диалоги выбора Counterparty; BE context schema; insert-table CTA; ADD-PAGE write queue (кроме минимального `onSection`/focus helper в editor).

## ACCEPT

1. Чип Клиента: «Изменить» → панель Данные, TOC Кому, виден select Клиент с текущим значением; смена значения → чип в Выбрано показывает нового.  
2. Чип Поставщика (если задан): → TOC Ещё + select Поставщик.  
3. Чип «N изделия»: «Изменить» → Товары/витрина; × по-прежнему чистит selection.  
4. Specs + `nx build kppdf-web` (или focused test zone) last.  
5. Коротко обновить `document-studio.page.md` §Выбрано: «Изменить → jump в Данные».

## known_limitation

Не deep-link на конкретную карточку в витрине (scroll-to-SKU) — достаточно категории Товары. Не менять badge-формулу.
