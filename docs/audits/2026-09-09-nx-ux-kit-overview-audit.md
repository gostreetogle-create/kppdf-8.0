# NX UX smell audit — `/kit/overview`

**TZ:** `TZ-NX-UX-00-kit-overview-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 00
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand-in-row + `pi-button` toolbar), `/kit/*` primitives
**Page source:** `frontend-nx/apps/kppdf-web/src/app/pages/kit/kit-overview.page.ts` (168 lines)
**Route:** `app.routes.ts` → `kit` → `overview` (default redirect target of `/kit`)

## Что это за страница

`/kit/overview` — статическая landing-страница UI Kit: сетка nav-карточек на
разделы кита (`/kit/foundations`, `/kit/forms`, `/kit/overlays` + два honest
placeholder-раздела), демо `PiFlowDiagramComponent` и `PiStatusBannerComponent`,
и справочные заметки для агентов внизу. **Нет** таблицы, фильтров, dropdown
или destructive-действий — страница вне зоны действия большинства строк
чеклиста по своей природе (не недосмотр).

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Таблица: нет expand / клик ничего не даёт | **N/A** | На странице нет таблицы вообще (только nav-карточки + 2 демо-компонента) |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **N/A** | Нет таблицы |
| A1 | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **OK** | Навигация — 3 карточки-ссылки `kit-overview.page.ts:35-66`, `no-underline` + `hover:bg-paper-2` + `pi-focus-ring`, без `underline`/голого текста. Это top-level nav-index (как оглавление раздела), а не row/toolbar-действие над записью — `pi-button`-обёртка на весь card-link здесь не эталон и не требуется каноном (эталон `pi-button` — для action-тулбара реестра/таблицы) |
| A2 | Destructive без confirm | **N/A** | На странице нет destructive-действий |
| F1 | Фильтры: поле без `pi-label` / голый native select | **N/A** | Фильтров нет |
| F2 | Фильтры: нет сброса чипа deep-link | **N/A** | Фильтров нет |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | Dropdown на странице нет |
| L1 | Layout: контент липнет к рамке (< `--space-3` / 12px) | **OK** | `pi-page-frame` + `p-4` (16px) внутри карточек (`kit-overview.page.ts:37,68,79`), `gap-4`, `mt-section`/`pt-6` между блоками — выше минимума `--space-3` |
| L2 | Layout: прыгающие ошибки валидации | **N/A** | На странице нет форм |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | Все 3 nav-ссылки (`/kit/foundations`, `/kit/forms`, `/kit/overlays`) резолвятся в реальные routes (`app.routes.ts:147-160`) — не мёртвые. Два placeholder-раздела («Базовые», «Навигация») — это `<div>`, не кликабельны, помечены `Статус: experimental` + текстом «скоро» honestly, а не false-affordance кнопка в никуда. Ссылка в копии на `docs/ui-rules.md` — файл существует. UI-текст на русском |

## Что уже ок (не чинить)

- Переиспользует канонические примитивы (`PiFlowDiagramComponent`, `PiStatusBannerComponent`) вместо самодельных виджетов.
- `standalone` + `OnPush`, без `any`, без raw `HttpClient` — по конвенции Angular 20.
- Честная маркировка незавершённых разделов (`opacity-60` + `Статус: experimental`) вместо мёртвых/декоративных кнопок.
- `pi-focus-ring` на всех интерактивных карточках — keyboard-доступность соблюдена.
- Все внутренние ссылки ведут на реально зарегистрированные routes (проверено по `app.routes.ts`), мёртвых переходов нет.

## Verdict

**PASS-EMPTY** — P0/P1 не найдено. Страница вне зоны большинства смелл-паттернов
(нет таблицы/фильтров/dropdown/destructive), а единственная применимая зона
(A1: действия) уже соответствует канону (`no-underline` + `pi-focus-ring`,
top-level nav-index, не row-toolbar — обёртка в `pi-button` не эталон для этого
паттерна). FIX TZ (`TZ-NX-UX-00-kit-overview-FIX`) — **skip**, WAVE row 00 FIX = N/A.
