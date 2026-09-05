# PROMPT — Claude peer: Сделки NX (analysis-only)

> **Для PO:** в Claude (MCP / Desktop / CLI) достаточно сказать:  
> «Прочитай целиком `tasks/PROMPT-CLAUDE-DEALS-NX-PEER.md` и ответь по его структуре. Файлы не меняй.»  
> Ответ Claude целиком вставь обратно в Cursor — Cursor финализирует WAVE/TZ.

---

## Режим

**ANALYSIS-ONLY.** Не редактировать product-код, не писать TZ в `tasks/`, не commit/push.  
Роль: независимый peer-архитектор + будущий менеджер цеха (~10 чел).  
Repo: `D:/kppdf-8.0` (или корень клона).

## Обязательно прочитай (tools)

1. `docs/audits/2026-09-05-deals-nx-migration-audit.md` — черновик Cursor  
2. `docs/pages/orders.page.md` — HUB expand / visual lock  
3. `docs/pages/manager-desk.page.md` — стол  
4. `frontend/src/app/shared/orders/order-hub-tray.component.ts` — эталон tray  
5. `frontend/src/app/pages/commercial/deals-group-chips.ts`  
6. NX: `frontend-nx/.../orders/orders-list.page.ts`, `order-detail.page.ts`, `proposals/proposals-list.page.ts`, `app.routes.ts`, `layout/nav-categories.ts`  
7. `docs/paper-and-ink.md` § Panel & expand inset + `docs/UX-FORM-CANON.md`  
8. `docs/PO-SHARED-UNDERSTANDING.md` §2 necessity; `docs/PO-CANON.md` (стол / reuse-first)  
9. `docs/audits/confidence/05-deals-contract.md` — write-path  
10. По желанию: Gantt-port pattern `docs/audits/2026-09-04-gantt-nx-port-audit.md` (как делали волну, не копировать тему)

## Цель продукта (слова PO)

- Вкладка/раздел сделок на NX сейчас «накидана строками»; в legacy объёмнее.  
- Порт **как Гант**: не тупой copy — аудит, связи, реестры, выкинуть кривое/лишнее, добавить недостающее.  
- Оператор: открыл → видит все сделки → раскрыл → **всё**, что связано, **по категориям**, красиво.  
- Текст **не к рамке** — inset-канон уже в docs; учитывай в рекомендациях.  
- Финальный вид — **лучше** legacy, не 1:1 копия багов.

## Твоя задача

Сверь Cursor-аудит с кодом. Согласись / опровергни с **evidence** (file:line или route).  
Ответь **строго** структурой ниже (русский, плотно, без воды). Объём: ~600–1200 слов или эквивалент таблиц.

### A. Вердикт одной фразой

Что сейчас на NX vs что нужно менеджеру.

### B. SoT рабочего места (выбери один + почему)

| Вариант | Плюс | Минус |
|---------|------|-------|
| A. Усилить `/orders` expand (порт tray) | | |
| B. Портировать `/desk` как дом сделок | | |
| C. Гибрид (что где) | | |

Рекомендация: **A / B / C** + 3 буллета риска.

### C. Матрица gap (дополни/поправь Cursor)

Колонки: capability · legacy · NX · severity (P0/P1/P2) · keep/drop/redesign.

Обязательно: contracts, counterparties, desk-notes, tray groups, proposals TOC chrome.

### D. Что выкинуть / упростить из legacy tray

Список шума для цеха 10 чел (с evidence). Что оставить обязательно.

### E. Реестры / данные-blockers

Что должно появиться в `/registries` или страницах **до** или **параллельно** hub (не раздувать).

### F. Предлагаемая WAVE (SIZE S|L)

Таблица: order · SIZE · provisional TZ-id · conflict keys hint · deps.  
Не смешивать с Gantt-registries / DocStudio Data IA в одном continuous.

### G. Inset / visual

3 конкретных места в legacy/NX, где риск «прилипания»; как проверять в AC.

### H. Вопросы PO (макс. 3, Да/Нет или одна цифра)

Только бизнес, не «какой Pi-*».

### I. Чего Cursor мог пропустить

1–5 пунктов.

---

## Стоп

После ответа — **стоп**. Не пиши файлы. TZ пишет Cursor после того, как PO вставит этот ответ в чат.
