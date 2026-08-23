# PROMPT — Freebuff: рабочий стол, раскрытый заказ

> Один агент. Не параллелить с правками того же tray. Deploy нет.

**PO:** новый чат Freebuff, блок ниже.

---

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DESK-423.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id=freebuff + claimed_at ISO + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/TZ-DESK-423-desk-order-tray-operator.md и выполни TZ.
Дизайн: docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md

НЕ git add -A. НЕ трогать docs/PO-*.md, composition-tree, backend schemas, desktop, Гант.
Только CONFLICT KEYS из TZ.

Суть: раскрытый заказ на /desk — рабочее место. «Добавить изделие» (кнопка, не underline) открывает panel=bom с OrderFormPanel variant=items, не полную «редактировать заказ». Убрать вечные подсказки; hint «Подтвердить» только по клику. Правые «Открыть» → компактные кнопки, disclosure. PATCH draft→confirmed только с desk. Shared tray, без форка. Gates из TZ. Archive 2026-08. Без деплоя.
```
