# TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET: воздух и плитки в expand заказа

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — **agent_id: claude** (Freebuff PARK 2026-09-07)  
**ЗАВИСИМОСТИ:** нет (D2 hub tray DONE; visual FAIL по скрину PO 2026-09-05)  
**LAYER:** 3  
**SIZE:** S  

**PAGES:** `/orders`  
**PAGE_DOCS:** `docs/pages/orders.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.spec.ts` ;  
`docs/pages/orders.page.md` (viz / inset note)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

### Preflight Check Output
- **Context read:** PO screenshot (ORD expand); `order-hub-tray.component.ts` (NX); `docs/paper-and-ink.md` § Panel & expand inset; `docs/UX-FORM-CANON.md` Panel inset; `docs/pages/orders.page.md` § Визуальная иерархия + DESK-428; legacy `frontend/.../order-hub-tray.component.ts` (`p-4`/`gap-5`, chevron)
- **Key Constraints:** Mode A N/A; reuse hub-only (no desk-write); visual lock 4 groups; no thicker “рамки ради рамок”
- **Planned Deliverable:** inset + tile rhythm only
- **Validation Path:** FIC N/A route; page.md note; jest tray + nx build

**Проверено:** NX tray `gap-4 p-4` + group `p-4`; toggle **`px-2 -mx-2`** (тянет текст к рамке); подблоки Снабжение/Производство/… только `border-t`, без собственного inset-карточки → «слитный» вид.  
Loose wording «по сделкам» → **этот TZ = NX `/orders` hub expand** (скрин). КП/договоры — не раздувать; если тот же FAIL — successor.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. PO: текст к краям плиток; 4 группы выглядят как один слипшийся текст; «в старой версии было иначе».
2. Канон: `paper-and-ink` Panel & expand inset — мин. 12px внутри hairline, предпочт. `p-4`; между группами `gap-4`–`gap-5`. Эталон DESK-428: `p-4` / `gap-5`.
3. Page.md visual lock: 4 группы (Заказ / Исполнение / Логистика / Документы) на мягкой подложке; не плоская жёлтая сетка; не усиливать рамки без PASS.

**Сбои оператора:**
- Не читает, где кончается «Снабжение» и начинается «Производство».
- На демо стыдно: «прилипло к рамке».
- Путает deep-link кнопки с заголовками блоков.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Outer tray + 4 группы
- Корневой grid: **`gap-5`** (не `gap-4`); padding tray **`p-4`** минимум (сохранить `bg-paper-2` / soft paper — не возвращать насыщенно-жёлтую сетку).
- Каждая из 4 `section[data-test^=order-group-]`: `hairline rounded-sm bg-paper` + **внутренний `p-4`**; заголовок группы с нормальным `mb-3` и без flush к бордеру.

### ШАГ 2 — Убрать прилипание
- Убрать **отрицательные margin** у disclosure (`-mx-2` и аналоги) на «Состав заказа» и любых row-toggles внутри tray.
- Hover/focus: `px-2` ок, но **без** `-mx-*`, которые вытягивают текст к hairline группы.
- Любой текст/ссылка внутри hairline-ячейки — не ближе `p-3`/`p-4` к рамке (канон inset).

### ШАГ 3 — Плитки внутри Исполнение / Логистика
Сделать подблоки **читаемыми плитками**, не одной колонкой через `border-t`:
- Снабжение, Производство, Готовность (в Исполнение);
- Склад, Отгрузка (в Логистика).

Каждый подблок: `rounded-sm bg-paper-2 p-3` (или `p-3` + лёгкий `hairline`, **не** двойная толстая рамка) + вертикальный **`gap-3`** между подблоками.  
Ритм: label → value/счётчики → CTA, выравнивание top. Deep-links и write-path **не** менять.

### ШАГ 4 — Тесты + docs
- Spec: нет `-mx-` на composition toggle; outer grid имеет `gap-5`; подблоки supply/production/readiness/warehouse/shipping существуют как отдельные inset-контейнеры (`data-test` сохранить).
- `orders.page.md`: одна строка — NX hub tray inset = Paper & Ink § Panel & expand + DESK-428 air (`p-4`/`gap-5`).

---

## ИЗМЕНЯТЬ
Файлы CONFLICT KEYS.

## НЕ ИЗМЕНЯТЬ
- Backend / order API / status semantics  
- Desk-write (confirm/ship/add-line) — не портировать  
- Группировку 4 колонок/групп и deep-link URL  
- Shared `frontend/` legacy tray (эталон воздуха — смотреть, не синхронно патчить dual-site)  
- Proposals/contracts list (вне скрина)  
- Усиление рамок «покрасивее» вместо воздуха  

---

## КРИТЕРИИ ПРИЁМКИ

1. Раскрытый заказ: текст/кнопки **не** вплотную к hairline (визуально ≥12px; классы `p-3`/`p-4` на группах и подплитках).
2. Четыре группы и подблоки Исполнение/Логистика читаются как **отдельные плитки**, не один слипшийся текст.
3. Нет `-mx-*` на toggles tray, тянущих контент к краю.
4. Поведение expand/composition/supply/reservations/links — без регресса (существующие tray specs зелёные + новые asserts).
5. Gates PASS.

## BUILD INTEGRITY

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=order-hub-tray
  cd frontend-nx && pnpm exec nx lint kppdf-web
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

## known_limitation
- Живой browser PASS — глазами PO (Playwright в репо нет).
- КП/договоры expand — отдельный TZ, если после PASS заказов PO покажет тот же FAIL.

## Финализация
Executor report (auto) full SHA → archive  
`tasks/_archive/2026-09/TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET.done.md`
