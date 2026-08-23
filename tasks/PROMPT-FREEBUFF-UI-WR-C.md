# PROMPT — Freebuff UI-WR Agent C (menu + gold + catalog)

> Слот 3 из 3. Старт сразу: 508→504.  
> **WR-507** только после: Agent A = WR-501 DONE **и** Agent B = WR-505 DONE.  
> Proof of adoption обязателен. Deploy запрещён.  
> Перед UI: прочитай `docs/ui-rules.md`.

```text
Ты — Freebuff Agent C · D:\kppdf-8.0 · main
GEMINI.md + kppdf-executor-loop. agent_id=freebuff-wr-c
Промт: tasks/PROMPT-FREEBUFF-UI-WR-C.md

Очередь (строго):
1) tasks/TZ-UI-WR-508-dropdown-menu-portal-fix.md
2) tasks/TZ-UI-WR-504-gold-contrast-sweep.md
   (после 508 — оба трогают pi-nav-dropdown)
3) WAIT: в _archive есть TZ-UI-WR-501.done.md И TZ-UI-WR-505.done.md
   Иначе poll/sleep и не бери 507 раньше времени.
4) tasks/TZ-UI-WR-507-shared-filter-panel.md
   (= filter shell + skeleton/error; WR-511 влит)

Цикл: CLAIM → gates → Proof of adoption → ONE commit/ID → push → next.
Не трогай: pi-dialog/drawer/sheet services, app.routes, proposal-create,
  manager-desk, builder-tool-pane, error-banner component API (только usage).

BAN: deploy; wipe; 507 до 501+505; DONE без proof.
DoD: таблица 508/504/507 | SHA | proof OK?
```
