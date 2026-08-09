# Промпт — TZ-SALES-332 (flyout polish + sync колонок)

Агент сделает: колонки панели = колонки на листе; ←→ и Видна/Скрыта реально работают; справа отдельная иконка «Таблица»; панели с воздухом; витрина не обрезается. Стыдно показывать — не сдавать.

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) Если tasks/_active/TZ-SALES-331.md ещё есть — сначала closeout 331 (если READY/DONE gates) или STOP и спроси; не мешай keys.
3) tasks/_active/TZ-SALES-332.md + checklist docs/agent-checklists/TZ-SALES-332.md
4) Status CLAIMED; agent_id + claimed_at ISO + workspace
5) _active-map + чужие keys → STOP при конфликте
6) Team Room claim best-effort

Прочитай:
- docs/audits/2026-08-09-kp-create-flyout-polish-audit.md
- tasks/_backlog/kp-vitrine/TZ-SALES-332-kp-flyout-table-rail-polish.md
- docs/ux/kp-create-studio-spec.md (разморозить Right rail: Параметры+Таблица)

Сделай TZ полностью. Deploy NO.
Archive только после Cursor/PO visual PASS.
Финальный отчёт: SHA + что кликнуть PO на /proposals/create.
```
