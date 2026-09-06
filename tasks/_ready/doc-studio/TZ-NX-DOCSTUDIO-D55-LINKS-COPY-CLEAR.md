# TZ-NX-DOCSTUDIO-D55: Связи — «КП» + сброс выбора + без двойного «Данные»

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff / Claude CLI  
**ЗАВИСИМОСТИ:** D50–D54 DONE  
**LAYER:** 3  
**SIZE:** S  
**PACK:** WAVE-DOCSTUDIO-DATA-IA-2 · `tasks/PROMPT-FREEBUFF-DOCSTUDIO-D55-D56.md`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts` ;  
`docs/pages/document-studio.page.md` (строка словаря Связи)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — полная сборка приложения (nx build kppdf-web)

---

### Preflight Check Output
- **Context read:** `docs/TZ-AUTHORING.md` §1.1; `docs/CONTEXT.md`; `docs/audits/2026-09-05-docstudio-data-panel-ia-audit.md`; `studio-data-panel.component.ts` (label «Коммерческое предложение» ~156; placeholder без empty-option); `select.component.ts` (`selectOption(value: string)` — null не выбирается); `studio-editor.page.ts` `onQuotationChange` / `ensureLinkedQuotation` effect
- **Key Constraints:** Mode A N/A (executor); UI label КП = Quotation; no second write-path; A4 geometry law
- **Planned Deliverable:** copy + clear options + remove inner heading
- **Validation Path:** FIC UI panel N/A route; page.md dictionary; `nx test` panel + `nx build kppdf-web`

**Проверено:** `studio-data-panel.component.ts`; `select.component.ts`; `docs/CONTEXT.md` (КП); D53 archive

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. В TOC «Связи» label селекта = **«Коммерческое предложение»** (хардкод) — для универсальной студии документов звучит как «это экран только КП». Сущность = `Quotation`; канон UI = **«КП»** (`docs/CONTEXT.md` / `TZ-AUTHORING` §1.1).
2. У селектов КП/Заказ/Клиент есть `placeholder="— не выбран —"`, но в списке **нет** option с пустым value. `app-pi-select.selectOption` принимает только `string` → после выбора **сбросить нельзя**. PO видит «обязательно что-то выбрать».
3. Двойной заголовок «Данные»: `kp-ws-panel__head` (`panelTitle`) + `<p class="heading">Данные</p>` внутри панели — зря жрёт высоту.
4. Для документов типа КП `effect` зовёт `ensureLinkedQuotation`, если `quotationId` пуст — сброс КП на КП-документе сразу восстановится (S20/S33). Это **не баг**, а lifecycle.

**Сбои оператора (≥3):**
- Выбрал чужое КП по ошибке → нельзя снять связь → строки таблицы из чужого КП.
- Новый договор/паспорт → видит «Коммерческое предложение» → думает, что студия только про КП.
- Уже выбран заказ → хочет отвязать → нет пункта «не выбран».

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Copy «Связи»
- Label + ariaLabel селекта quotation: **«КП»** (не «Коммерческое предложение»).
- Hint сверху «Связи» оставить/чуть уточнить: связь листа с **КП или заказом** как источниками номера/строк (универсально для любого docType).
- «Статус КП» — без смены (уже за `showKpStatus` / `isKpDoc`).

### ШАГ 2 — Пункт «ничего не выбрано»
В **каждом** select секции Связи (КП, Заказ) и секции Кому (Клиент; Плательщик если открыт) + Ещё (Поставщик) добавить **первым** option:

```html
<app-pi-select-option value="">— не выбран —</app-pi-select-option>
```

(для КП: «— не выбрано —» согласовать с placeholder).  
`valueChange` уже шлёт `''` → существующие `onQuotationChange` / `onOrderChange` / counterparty handlers чистят поле.

**КП-документ:** empty option **оставить** (оператор видит сброс); known_limitation — auto-ensure может вернуть связь. В тесте non-KP или unit на наличие option достаточно; не ломать `ensureLinkedQuotation`.

### ШАГ 3 — Убрать внутренний заголовок
Удалить `<p class="heading">Данные</p>` и неиспользуемые стили `.heading`. Заголовок панели = только shell `panelTitle`.

### ШАГ 4 — Тесты + page.md
- Обновить `studio-data-panel.component.spec.ts`: label «КП»; empty option существует; нет текста «Коммерческое предложение»; нет `.heading` / `Данные` внутри body (кроме TOC если останется).
- В `document-studio.page.md` § словаря Связи: «КП» (не полное название).

---

## ИЗМЕНЯТЬ
- `studio-data-panel.component.ts` / `.spec.ts`
- `docs/pages/document-studio.page.md` (точечно)

## НЕ ИЗМЕНЯТЬ
- Backend / `putDataSet` / quotation lifecycle API
- Перенос «Выбрано» на rail → **D56**
- `frontend/` legacy
- Правый rail / Properties

---

## КРИТЕРИИ ПРИЁМКИ

1. В «Связи» label селекта = **«КП»**; строки «Коммерческое предложение» в UI панели нет.
2. В открытом списке КП и Заказ есть пункт сброса; выбор `''` чистит context field (для non-KP quotation / любого order).
3. Внутри body панели нет второго заголовка «Данные» — только shell head.
4. Gates PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-data-panel
  cd frontend-nx && pnpm exec nx lint kppdf-web
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**

## known_limitation
- На docType=КП сброс `quotationId` может быть тут же восстановлен `ensureLinkedQuotation` — отдельный UX (скрыть clear / read-only) = successor, не D55.
- Перенос «Товары» на rail — не в этой волне (PO: сейчас только «Выбрано»).

## Финализация
Checklist → `## Executor report (auto)` → archive `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D55-LINKS-COPY-CLEAR.done.md` → сразу D56.
