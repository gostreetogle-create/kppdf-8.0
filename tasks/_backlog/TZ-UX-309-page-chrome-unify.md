═══════════════════════════════════════════════════════════════
TZ-UX-309: Единый page chrome (эталон Справочники)
═══════════════════════════════════════════════════════════════

> Бывший черновик ошибочно назван TZ-UX-302 — тот ID уже в архиве
> (categories dead-code). Новый номер: **309**.
> Клиенты/Цех/Сделки chips уже частично NAV-302 — добить остальные разделы.

STATUS: READY

РОЛЬ: Frontend

LAYER: 3

ЗАВИСИМОСТИ: TZ-NAV-302 DONE; FORM wave merged to main (желательно)

CONFLICT KEYS:
frontend/src/app/shared/page/pi-group-workspace.component.ts;
frontend/src/app/shared/page/pi-page-chrome.component.ts;
frontend/src/app/pages/supply/supply.page.ts;
frontend/src/app/pages/shipping/shipping.page.ts;
frontend/src/app/pages/design/design.page.ts;
frontend/src/app/pages/doc-constructor/documents/documents.page.ts;
docs/pages/ui-page-chrome.md;
docs/agent-checklists/TZ-UX-309.md;
docs/agent-checklists/_active-map.md;

---

## ЧТО ДЕЛАТЬ

1. `docs/pages/ui-page-chrome.md` — эталон; workspace vs page-chrome.
2. Снабжение / Отгрузка / Проектирование / Архив документов → тот же chrome/chips паттерн.
3. Не ломать NAV-302 chips Клиенты/Цех/Сделки.
4. НЕ: production cockpit deep; app-layout nav; deploy; form-dialogs.

## AC

- [ ] Единый path/chips паттерн на перечисленных страницах
- [ ] docs ui-page-chrome.md
- [ ] tsc PASS; archive; push
