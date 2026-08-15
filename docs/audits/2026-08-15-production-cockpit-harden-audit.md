# Audit: Production cockpit harden → 98–99

**PO:** 2026-08-15 — после CASCADE «всё супер»; добить масштаб/меню/синхрон/архитектуру/доки.
**Baseline:** WAVE-GANTT-TREE 314–320 + CASCADE 321–323 DONE на `main`.

---

## Findings (code-backed)

| # | Smell | Evidence | Target TZ |
|---|--------|----------|-----------|
| 1 | **Неделя узкая** — фиксированные `GANTT_PX_PER_DAY.week = 12`, не заполняет ширину студии | `gantt-bars.component.ts` ~25–28, `pxPerDay` | **324** |
| 2 | **«Весь горизонт»** почти no-op: только `applyFilteredActive()` (range по bars); плотность не меняется; название непонятно | `production-cockpit.page.ts` `onFitHorizon` ~685–687 | **324** |
| 3 | **«Сегодня»** не скроллит к маркеру — лишь расширяет range если today вне окна | `onToday` ~676–681 | **324** |
| 4 | **Status pips** в flyout «Заказы» дублируют текст статуса; на Ганте уже убрали | `orders-rail.component.ts` ~61–64, ~172–176 | **325** |
| 5 | Flyout «Заказы» ≈ дубль левой колонки Ганта; PO хочет ценность: **заказчики** → клик → заказы на Ганте | `Order.counterpartyId` в `orders.service.ts` | **325** |
| 6 | Фильтры дат wired (`dateFrom`/`dateTo` → `filtersChanged`), но UX/пустое состояние слабо; проверить E2E | `orders-rail` + `filterOrdersForRail` | **325** (verify) |
| 7 | **Синхрон даты:** meta Save → PATCH + reload; drag plannedDate gated `canEditCatalog` vs meta `canEditOrder` — рассинхрон ролей; PO: «менял дату — ничего» | `onOrderMetaCommit` / `onPlannedDateMoveCommit` | **326** |
| 8 | После каскада: толстый `gantt-bars` + page god-ish; нужен light smart/dumb pass | component sizes | **327** |
| 9 | `production-cockpit.page.md` / SoT отстают от CASCADE | page docs | **328** |

---

## Frozen IA (harden)

```
Масштаб:
  День | Неделя = режимы плотности
  Неделя (и fit): px/day = max(minPx, timelineClientWidth / dayCount) — заполняет ширину
  «Вместить сроки» (бывш. Весь горизонт): range = min…max bars + fit density + scroll start
  Сегодня: today в range + scrollLeft к маркеру

Заказы (left flyout):
  — убрать цветные status-pips
  — режим/секция «Заказчики» (Counterparty): клик → filter Gantt по counterpartyId
  — список заказов остаётся (поиск по номеру); не второй CRUD

Фильтры: active / приоритет / даты — работают на rail + Gantt; RU empty states

Write-paths (без новых API):
  plannedDate / priority → PATCH orders/:id → bars rebuild
  estimate-days / estimate-start / WorkType.days — как 309–316/321
  Roles: meta+drag plannedDate = canEditOrder (admin|manager); catalog days = production:write
```

**Out:** fact production, ProductionOrder, wipe/deploy, MS-Project links.

---

## Scoreboard (agent updates)

| Area | Start | Target |
|------|-------|--------|
| Cascade UX | ~95 | keep |
| Zoom / horizon / today | ~55 | 98 |
| Orders/Filters flyouts | ~60 | 95 |
| Write sync | ~70 | 99 |
| Component architecture | ~65 | 90 |
| Page docs / SoT | ~70 | 99 |
| **Overall /production estimate studio** | ~75 | **98–99** |

---

## Wave

`tasks/_backlog/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
Prompt: `tasks/_backlog/PROMPT-PRODUCTION-COCKPIT-HARDEN.md`
Master: `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`

---

## Final closeout scoreboard — TZ-PRODUCTION-328 (2026-08-15)

| Area | Final evidence | Score |
|------|----------------|-------|
| Cascade UX | 321–323 landed; one full-width meta/detail cascade; bottom `Карточка` removed | 98 |
| Zoom / horizon / today | 324: Week fit-width, **Вместить сроки** is range+fit+scroll, **Сегодня** is range+marker scroll | 98 |
| Orders / filters | 325: no status-pips; Заказчики/Counterparty and date filters feed rail + Gantt | 98 |
| Write sync | 326: plannedDate Save/summary drag use `canEditOrder`; successful writes reload; existing API only | 99 |
| Component architecture | 327: smart boundaries documented; one focused dumb scale-controls extract; no UX rewrite | 96 |
| Page docs / SoT | 328: page.md and Gantt spec synchronized; index, resume, archive/lock complete | 99 |
| **Overall estimate studio** | all required 324–328 gates and docs complete; fact shop-floor remains OUT | **98/100** |

**Final verdict:** `STUDIO ESTIMATE PASS 98/100` — ready to propose deployment, **do not deploy automatically**. This score is not a production fact/shop-floor readiness claim.

**Gates carried forward:** frontend tsc PASS; production Jest 6 suites / 70 tests PASS after TZ-327; lint PASS with 18 existing architecture warnings; targeted Prettier PASS. Browser smoke remains dependent on a live API/browser environment and was not run in TZ-327/328.
