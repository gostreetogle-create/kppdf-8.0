# PROMPT — Claude: HUB TABLE PARITY continuous (01→04)

Скопируй **целиком** в Claude (лучше через `D:\kppdf-8.0\.claude\run-continuous.cmd`).  
Одна сессия — вся волна. Resume по живому чеклисту.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?» / «можно дальше?» — AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Canon: docs/audits/2026-09-10-nx-hub-table-parity-canon.md
WAVE: docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md
ЖИВОЙ ЧЕКЛИСТ (обязателен): docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md
Эталон UI: /registries (плотность + ▸ + pi-icon-btn) · hub: OrderHubTray · actions: app-pi-row-actions
Почему волна: прошлый UX-sweep закрыл pi-button, но страницы всё ещё «белый лист» vs реестры.

[ГЛОБАЛЬНАЯ ЗАДАЧА]
Довести 4 страницы до parity: counterparties → orders → supply → warehouses.
Строго последовательно (один implicit conflict: nx build kppdf-web).

Чеклист-протокол:
- Старт стадии → status IN_WORK (одна строка) в HUB-TABLE-CONTINUOUS-CHECKLIST.md
- Конец → DONE + SHA + ISO | BLOCKED→STOP
- Resume = первая PENDING/IN_WORK; DONE не переделывать
- После каждой стадии: sync WAVE row Status

Очередь:
01) tasks/_ready/nx-hub/counterparties/TZ-NX-HUB-01-counterparties.md
    Hub: Реквизиты / Объекты / Заказы / КП / Договоры; icon edit/delete;
    PiOrdersService+PiQuotationsService list({counterpartyId})
02) tasks/_ready/nx-hub/orders/TZ-NX-HUB-02-orders.md
    ▸ affordance + denser list; «Карточка»→icon; tray логику не ломать
03) tasks/_ready/nx-hub/supply/TZ-NX-HUB-03-supply.md
    chevron + denser + compact status CTA; richer expand; NO fake copy; NO confirmedBy ObjectId
04) tasks/_ready/nx-hub/warehouses/TZ-NX-HUB-04-warehouses.md
    expand остатки + chip /storage-items?warehouseId=; icon actions

Каждая стадия:
CLAIM (_active + checklist _TEMPLATE, agent_id=claude) → baseline nx build если красный STOP
→ код строго по TZ → focused tests → nx build kppdf-web LAST
→ archive tasks/_archive/2026-09/ → commit → push → отметить чеклист/WAVE → next
Без «продолжать?».

[ОГРАНИЧЕНИЯ]
НЕ: /production Гант; DocStudio/документы; desk; wipe; deploy без PO; BE schema invent;
    второй write-path; параллель двух page FIX; чужой WIP; сырой ObjectId в UI.

[ФОРМАТ]
Сначала <thinking> план стадии vs AC. Потом работа. Финал волны:
checklist status COMPLETE; docs/agent-checklists/_NOW.md Claude IDLE;
Executor report: #01–#04 → SHA.
Self-check: H1–H6 канона закрыты на каждой странице; build green.
```
