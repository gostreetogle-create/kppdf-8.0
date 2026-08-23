# PROMPT — Freebuff / Claude executor: DESK-425 wave (tray workspace)

> **PO directive 2026-08-23:** expand заказа на `/desk` = рабочее место. Никаких перескоков на другие страницы из tray. Chips = единственный cross-page путь с `orderId`.
> **Audit:** `docs/audits/2026-08-23-desk-tray-workspace-audit.md`
> **Read first:** `GEMINI.md`, `docs/PO-CANON.md`, `docs/pages/manager-desk.page.md`

---

## Твоя роль

Ты **executor**, не архитектор. Делаешь **5 TZ по порядку**, claim → code → gates → archive → commit. Не расширяй scope.

## Порядок волны

| # | TZ file | Можно параллельно |
|---|---------|-------------------|
| 1 | `tasks/TZ-DESK-429-supply-chrome-ghost-chips-row.md` | Да (с 428) |
| 2 | `tasks/TZ-DESK-428-tray-padding-disclosure-affordance.md` | Да (с 429) |
| 3 | `tasks/TZ-DESK-425-tray-workspace-no-nav.md` | После или параллельно 428 |
| 4 | `tasks/TZ-DESK-426-workflow-chips-order-context.md` | После 425 |
| 5 | `tasks/TZ-DESK-427-rail-dedup-chips-sot.md` | После 425+426 |
| 6 | `tasks/TZ-DESK-430-desk-ship-without-document.md` | После 425 |

**Жёсткая зависимость:** 427 после 425/426; 430 после 425 (ship action в tray).

---

## Старт каждой TZ

```bash
cd D:/kppdf-8.0
git status && git branch
# Claim: tasks/_active/TZ-DESK-XXX.md + checklist slot agent_id + claimed_at ISO
```

Conflict keys — только из шапки TZ. Чужие `_active` не трогать.

---

## PO checklist (ничего не пропустить)

### A. Tray = workspace (425)

- [ ] В `mode="desk"` **ноль** `routerLink` / `router.navigate` на `/supply`, `/production`, `/storage-items`, `/shipping`, `/doc-constructor`, `/orders/:id`.
- [ ] Кнопка «Снабжение» → flyout `panel=supply` + `SupplyQuickOrderComponent` с текущим `orderId`.
- [ ] «Создать документ» / «Шаблоны» → **R-flyout** `panel=docs` на `/desk`, не смена path.
- [ ] Производство/склад/отгрузка — inline read + подсказка «полный раздел через chip сверху», **не link**.
- [ ] `mode="hub"` на `/orders` — **без регрессии** ссылок.

### B. Chips несут заказ (426)

- [ ] Expanded `orderId` → все workflow chips (кроме bare desk) получают `orderId` + `from=desk`.
- [ ] Chip «Снабжение» → `/supply?orderId=…&view=quick&from=desk` + видимый фильтр.
- [ ] Chip «Отгрузка» → shipping с фильтром/banner по заказу.
- [ ] Кнопка «На стол» на supply/shipping при `from=desk`.
- [ ] Chip «Стол» возвращает expand того же заказа.
- [ ] Chip «КП» с expand → КП с данными заказа, не пустое.

### C. Rail dedup (427)

- [ ] Правый icon-rail **пуст** при expand.
- [ ] Левый rail: create, filter, summary, notebook — **остаётся**.
- [ ] «Редактировать заказ» доступен из tray (не из rail).

### D. Визуал (428)

- [ ] Padding tray cards ≥ p-4; текст не у hairline.
- [ ] Disclosure: chevron + hover; «раскрыть» читается как control.

### E. Supply chrome (429)

- [ ] Пустая gold-row chips **не рендерится** когда chips=[].
- [ ] TOC «Закупки|Отгрузка» flush под header.

### F. Отгружено без документа (430)

- [ ] Кнопка «Отгружено» в tray → confirm-dialog с автоданными заказа.
- [ ] POST ship (не PATCH status); остаёмся на `/desk`.
- [ ] Блок «Отгружен»: номер, дата, «Документ не оформлен» — норма, не ошибка.

---

## Gates (каждая TZ)

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- order-hub-tray manager-desk pi-group-workspace supply --runInBand
cd frontend && pnpm lint
git diff --check
```

Deploy **не** запускать.

---

## Manual smoke (PO сценарий)

1. `/desk` → expand З-2026-003 (или любой с позициями).
2. Клик «Снабжение» в tray → flyout, URL still `/desk?orderId=…&panel=supply`.
3. Закрыть flyout → expand на месте.
4. Клик «Снабжение» **chip** сверху → `/supply` с фильтром этого заказа.
5. «На стол» → обратно expand.
6. Disclosure «Снабжение и производство» — chevron, очевидный hover.
7. `/supply` без expand — нет пустой полоски над TOC.
8. «Отгружено» в tray → dialog → confirm → блок с датой и номером отгрузки, без документа — норма.

---

## Решения PO (не обсуждаются — исполнять)

| # | Тема | Решение |
|---|------|---------|
| 1 | КП из выбранного заказа | Подставлять данные заказа в новое КП (клиент, позиции) |
| 2 | Производство в tray | Только сводка; полный гант — chip «Гант» |
| 3 | Смена статусов | Только подтверждение черновика; остальное — от процессов/документов |
| 4 | Документы/шаблоны | Desk R-flyout (как bom/notebook), без ухода со страницы |
| 5 | Отгрузка | Без документа можно; «Отгружено» сохраняет метаданные → блок в tray |

Chip «КП» с expand: prefill в `proposal-create` (`source=order&sourceId=`).

---

## Archive

Each done → `tasks/_archive/2026-08/TZ-DESK-XXX.done.md` with gates + SHA.  
Update `docs/pages/PAGE-TZ-INDEX.md` + `docs/pages/manager-desk.page.md`.  
Clear `_active/` slot.

---

## Запреты

- Не трогать backend без TZ.
- Не новые routes.
- Не WebSocket / offline / MF.
- Не «заодно» рефакторить orders hub.
- Не закрывать TZ без green tests.

---

## Commit message style

```
fix(desk): tray workspace without route jumps (DESK-425)

```

One functional commit per TZ or one wave commit if PO prefers — follow `docs/GIT-POLICY.md`.

---

## Если застрял

- Tray supply flyout: copy pattern from `panel=bom` flyout in `manager-desk.page.ts`.
- Shipping order filter missing: minimal chip banner like supply `orderFilterId`.
- Conflict with active TZ → STOP, report in archive as BLOCKED.

**Outcome PO expects:** стол перестаёт быть «набором кнопок-ссылок»; expand = работа с заказом; chips = осознанный переход в другой раздел **с контекстом заказа**.
