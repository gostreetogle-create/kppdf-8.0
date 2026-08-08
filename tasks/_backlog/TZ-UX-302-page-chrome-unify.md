═══════════════════════════════════════════════════════════════
TZ-UX-302: Единый page chrome (эталон Справочники)
═══════════════════════════════════════════════════════════════

> READY after or ∥ UX-301 (не трогать app-layout nav)  
> Эталон: `dictionaries/*` + `PiGroupWorkspace`  
> Canon: `docs/audits/2026-08-08-chrome-nav-admin-smell.md`

STATUS: READY (RESERVED — после UX-301 предпочтительно)

РОЛЬ: Frontend

LAYER: 3

CONFLICT KEYS:
frontend/src/app/shared/page/pi-group-workspace.component.ts;
frontend/src/app/shared/page/pi-page-chrome.component.ts;
frontend/src/app/pages/supply/supply.page.ts;
frontend/src/app/pages/shipping/shipping.page.ts;
frontend/src/app/pages/design/design.page.ts;
frontend/src/app/pages/counterparties/counterparties.page.ts;
frontend/src/app/pages/commercial/proposals/proposals.page.ts;
frontend/src/app/pages/contracts/contracts.page.ts;
frontend/src/app/pages/doc-constructor/documents/documents.page.ts;
docs/pages/ui-page-chrome.md;
docs/agent-checklists/TZ-UX-302.md;
docs/agent-checklists/_active-map.md;

---

## ЧТО ДЕЛАТЬ

1. Написать `docs/pages/ui-page-chrome.md` — эталон Справочники; когда workspace vs page-chrome.  
2. Снабжение / Отгрузка / Проектирование / Клиенты: перевести на `PiGroupWorkspace` с pathLabel раздела (или выровнять PiPageChrome токены 1:1 с path row — предпочтительно workspace если есть соседние страницы раздела).  
3. Сделки (КП, договоры): проверить pathLabel «Сделки» + chip/toc единообразие.  
4. Документы: крошки/workspace как эталон.  
5. Не трогать Production cockpit в этом TZ.  

## AC

- [ ] Визуально один паттерн path на перечисленных страницах  
- [ ] Docs ui-page-chrome.md  
- [ ] tsc PASS; archive; push  

НЕ: compact nav; production deep; deploy
