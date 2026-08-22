# PROMPT — Freebuff CONTINUOUS: вся волна Manager Desk (до deploy-ready)

> **Один чат, без остановок.** PO ушёл на несколько часов. Твоя задача — закрыть
> очередь ниже **подряд**, без «продолжать?», «ок?», «что дальше?».
> **Deploy НЕ запускать** — VPN выключен; в конце только «готово к деплою».

Скопируй **весь файл** в новый чат Freebuff и начни немедленно.

---

## 0. Режим работы (жёстко)

Прочитай и следуй:

- `GEMINI.md`
- `.agents/skills/kppdf-executor-loop/SKILL.md`
- `docs/PO-CANON.md`
- `docs/agent-checklists/_NOW.md` (истина очереди — обновляй in-place)
- `docs/agent-checklists/DESK-SMOKE.md` (финальная приёмка)

**Цикл на каждый TZ:**

1. CLAIM → `tasks/_active/TZ-DESK-NNN.md` + checklist `docs/agent-checklists/TZ-DESK-NNN.md`
2. Код строго по TZ + conflict keys
3. Gates из TZ (tsc / jest / eslint зоны)
4. Archive `tasks/_archive/2026-08/TZ-DESK-NNN.done.md` + lock `.mimocode/locks/`
5. **commit + push** только своих путей (никогда `git add .`)
6. Обнови `_NOW.md` (ACTIVE / DONE / NEXT)
7. **Сразу** следующий TZ — не жди PO

**СТОП только если:**

- Реальный конфликт conflict keys с чужим `_active/` → DEFER + запись в `_NOW`, бери следующий без overlap
- Gates FAIL после 2 попыток fix → archive `.failed.md`, запись в `_NOW`, **не** deploy
- Нужен wipe / secrets / архитектурный выбор без ответа в TZ → checkpoint в `_NOW`, idle

**НЕ СТОП:** «раскладка v2 ok», «продолжать?», «очередь пуста» (если ещё есть TZ ниже).

**Deploy:** `.\deploy\synology\deploy.ps1` **ЗАПРЕЩЁН** в этой сессии. PO сделает «кати» после VPN.

PO делегировал полную реализацию стола на время отсутствия — gate «раскладка ok» **снят** для 402+.

---

## 1. Очередь (строго по порядку)

| # | TZ | Файл | Зависимость |
|---|-----|------|-------------|
| 1 | **406** | `tasks/TZ-DESK-406.md` | 405 DONE |
| 2 | **402** | `tasks/TZ-DESK-402.md` | после 406 |
| 3 | **412** | `tasks/TZ-DESK-412.md` | после 402 |
| 4 | **403** | `tasks/TZ-DESK-403.md` | после 412+402 |
| 5 | **413** | `tasks/TZ-DESK-413.md` | **сразу после 403** — tray visual |
| 6 | **410** | `tasks/TZ-DESK-410.md` | после 413 |
| 7 | **411** | `tasks/TZ-DESK-411.md` | после 402 |
| 8 | **407** | `tasks/TZ-DESK-407.md` | после 403 |
| 9 | **404** | `tasks/TZ-DESK-404.md` | after 407 DONE |
| 10 | **408** | `tasks/TZ-DESK-408.md` | если #1–9 DONE и время есть |

Spec 413: `docs/superpowers/specs/2026-08-18-order-hub-tray-visual.md`

**409** — backlog, не брать.

Перед каждым TZ: если файла нет в `tasks/`, копируй из `_backlog/` в `tasks/TZ-DESK-NNN.md`.

---

## 2. CLAIM первым (TZ #1 — 406)

```
Get-Location; git rev-parse HEAD; git status -sb
```

1. Repo `D:\kppdf-8.0`, branch `main`, pull если behind
2. `tasks/_active/` пуст или только твой claim
3. Copy `tasks/TZ-DESK-406.md` → `tasks/_active/TZ-DESK-406.md`
4. Checklist `docs/agent-checklists/TZ-DESK-406.md` → Status CLAIMED + agent_id + ISO time
5. Team Room claim best-effort

**Канон chrome (406):** `docs/pages/page-chrome.md` § Рабочий стол — одна `app-pi-group-workspace` chip-row, **без** «Рабочий стол», ширина как `/orders`.

---

## 3. Критичные правила зоны desk

- **Reuse-first:** форма = `order-form-panel` из orders; tray = extract shared с `/orders` (412); не второй FormGroup / write-path
- **Один hot file:** `manager-desk.page.ts` — не параллель с другим агентом на desk
- **Invalid orderId:** RU toast/inline, clear query, no white screen
- **After create:** stay on `/desk`, expand new order, F5 via query params
- **Fixture убрать** в 402 — живой `GET /orders`
- **Regression:** `/orders` hub и order-form-dialog остаются рабочими
- **Chrome canon:** после 406 все desk TZ следуют `page-chrome.md` § `/desk` — не возвращать «Рабочий стол» в body chrome (407/404 included)

Эталоны: `orders.page.ts`, `page-chrome.md`, `docs/superpowers/specs/2026-08-18-manager-desk-design.md`

---

## 4. Gates по волне (минимум)

После **каждого** TZ — gates из этого TZ.

Перед финальным idle (вся очередь или stop на blocker):

```powershell
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern="manager-desk|desk-order|order-form-panel"
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
```

Если 408 делался — добавь backend tests pattern `desk-note`.

**Smoke manual (запиши в `_NOW`):** пройди `docs/agent-checklists/DESK-SMOKE.md` пункты, что можно без prod deploy (local dev).

---

## 5. Финальный отчёт PO (когда очередь исчерпана или stop)

Один блок в `_NOW.md` + короткий текст:

```
DESK WAVE checkpoint
- Done: 406, 402, … (список + SHA каждого)
- Failed/Deferred: …
- HEAD: <sha> == origin/main? 
- Smoke DESK-SMOKE: X/Y pass (local)
- Deploy: НЕ ЗАПУЩЕН (VPN). PO: «кати» когда вернётся.
- Критичные файлы: manager-desk.page.ts, desk-order-tray, order-form-panel, …
```

**Не писать «задача закрыта»** для волны целиком — только per-TZ archive + verify.

---

## 6. Если сессия оборвалась

Следующий агент: прочитай `_NOW.md` → продолжай с первого не-DONE в таблице §1.
Не переделывай архивированные TZ.

---

Начинай с **TZ-DESK-406** сейчас.
