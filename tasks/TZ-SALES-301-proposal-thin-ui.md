═══════════════════════════════════════════════════════════════
TZ-SALES-301: Одно КП — сущность + тонкий список/карточка статуса
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Full-stack lite (sales)
ЗАВИСИМОСТИ: JOURNEY-301 (карта); data-model: выбрать ОДНУ из
  Proposal|Quotation|CommercialProposal (решение в TZ: **Proposal** как
  канон имени UI «Коммерческое предложение»; остальные не трогать миграцией
  в этом TZ — только не строить UI на дублях).
LAYER: 3+4
PAGES: /proposals (NEW)
PAGE_DOCS: proposals.page.md (NEW)

CONFLICT KEYS:
backend/src/modules/ (только выбранный proposal/quotation module — указать
  в execution notes после audit какого файла реально есть);
frontend/src/app/pages/proposals/;
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
docs/pages/proposals.page.md;
docs/agent-checklists/TZ-SALES-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Поток директора/менеджера начинается с КП. В routes **нет** /proposals.
В data-model три дубля КП. Для цеха на 10 человек нужен **один** список:
создать → статусы (черновик/отправен/подтверждён) → связать с заказом позже.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (узко)
═══════════════════════════════════════════════════════════════

ШАГ 1 — Audit backend: какой модуль уже bootstrapped; выбрать один API.
ШАГ 2 — Thin UI: pi-table list + form dialog (клиент, сумма/позиции minimally,
  status). Без конструктора КП-блоков и без PDF в этом TZ.
ШАГ 3 — Nav «Сделки» + пункт КП; page key для ACCESS.
ШАГ 4 — Кнопка «Создать заказ из КП» может быть stub/disabled + TODO
  successor — не обязана работать end-to-end здесь.
ШАГ 5 — Executor report.

НЕ: Гант, бухгалтерия, полное слияние трёх схем БД (отдельный TZ миграции).
НЕ: богатый редактор КП как Word.

AC: /proposals в меню у Manager/Director; CRUD list работает; одна сущность
  в UI; Executor report.
ПРОМПТ: GEMINI.md + tasks/TZ-SALES-301-proposal-thin-ui.md.
Checklist TZ-SALES-301. Push нет.
