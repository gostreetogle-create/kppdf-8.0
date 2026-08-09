# Промпт — WAVE-KP-TABLE-CONFIG (307 → 330 → 331)

Скопируй агенту-исполнителю целиком.

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/<TASK-ID>.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort

Канон (обязательно): docs/audits/2026-08-09-kp-table-config-canon.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-TABLE-CONFIG.md

Очередь строго:
1) TZ-DOC-TABLES-307 — tasks/_backlog/doc-tables/TZ-DOC-TABLES-307-kp-category-preset.md
   checklist: docs/agent-checklists/TZ-DOC-TABLES-307.md
2) TZ-SALES-330 — tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md
   checklist: docs/agent-checklists/TZ-SALES-330.md
3) TZ-SALES-331 — tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md
   checklist: docs/agent-checklists/TZ-SALES-331.md

Правила:
- Документы = библиотека пресетов; Create = экземпляр раскладки (не PATCH TableTemplate).
- Нет колонки скидки; наценка фоном → unitPrice только в КП.
- НДС только в подвале на всё КП.
- Не трогать FROZEN shell 317, print 320, snapshot 322, DOC-343 WIP, deploy.
- После каждой TZ: gates из TZ → Executor report (auto) → archive только после Cursor/PO PASS если TZ требует.
- Без стопов «ок/поехали» между TZ волны.
- Очередь пуста → отчёт «готово предложить деплой»; deploy НЕ запускать.
```
