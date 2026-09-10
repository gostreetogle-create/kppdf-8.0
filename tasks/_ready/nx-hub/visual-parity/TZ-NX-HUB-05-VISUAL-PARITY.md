# TZ-NX-HUB-05-VISUAL-PARITY: глазная сверка реестры ↔ 4 hub-страницы + fix gaps

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** WAVE-NX-HUB-TABLE-PARITY 01–04 DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/registries` ; `/counterparties` ; `/orders` ; `/supply` ; `/warehouses`  
**PAGE_DOCS:** `counterparties.page.md` ; `orders.page.md` ; `supply.page.md` ; `warehouses.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/counterparties/**` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` ;  
`docs/audits/2026-09-10-nx-hub-visual-parity.md` (create) ;  
`docs/agent-checklists/HUB-VISUAL-PARITY-CHECKLIST.md` ;  
`docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-10-nx-hub-table-parity-canon.md` (H1–H6); registries gold; HUB 01–04 SHAs
- **Key Constraints:** Эталон = `/registries` expand panel + row icons. Сам открыть UI (browser/Playwright). Gaps → fix на той же странице. Не трогать Гант/DocStudio.
- **Planned Deliverable:** audit markdown + fixes if FAIL + green build
- **Validation Path:** audit PASS; focused tests; `nx build kppdf-web` last

---

## ИСХОДНОЕ СОСТОЯНИЕ

Код HUB 01–04 закрыт по AC. PO хочет **глазную** уверенность: раскрытое меню/tray выглядит и ведёт себя в одном ритме с реестрами (плотность, chevron, иконки, блоки expand), а не «каждый по-своему».

Стек: `http://localhost:4201/` (если мёртв — `node start.mjs --nx --no-browser`, дождаться health).

## ЧТО ДЕЛАТЬ

1. **Эталон:** открыть `/registries` → раскрыть категорию (напр. Материалы) → зафиксировать: chevron, hairline table, `pi-icon-btn` row actions, плотность, expand inset/`bg-paper-2`.
2. **Пройти по порядку** (логин если нужен — demo/admin из `.env` / seed, не invent wipe):
   - `/counterparties` — expand hub + icons
   - `/orders` — expand hub tray + ▸ + icon card
   - `/supply` — expand + compact CTA
   - `/warehouses` — expand остатки + icons
3. На **каждой** странице заполнить матрицу в `docs/audits/2026-09-10-nx-hub-visual-parity.md`:

| Route | H1 chevron | H2 hub/blocks | H3 icons | H4 density | H5 no ObjectId | H6 destructive confirm | Expand looks like registries rhythm | Verdict |
|-------|------------|---------------|----------|------------|----------------|------------------------|--------------------------------------|---------|

Verdict: `PASS` | `FAIL` + file:line + screenshot path (если Playwright) или DOM note.

4. **Сравнение expand-панелей между собой:** одинаковый inset, типографика блоков (`pi-label` + value), hairline, не «белый лист» внутри tray. Если одна страница выбивается — выровнять к лучшему из HUB/registries (reuse classes, не invent theme).
5. **FIX:** любой FAIL H1–H6 или явный visual mismatch на scoped pages — починить в этом же TZ (минимальный diff). Mid-fix smell на той же странице — чинить.
6. Specs если меняешь поведение; `nx build kppdf-web` last.
7. Чеклист `HUB-VISUAL-PARITY-CHECKLIST.md` → COMPLETE; `_NOW` Claude IDLE; WAVE note VISUAL DONE.

## НЕ ИЗМЕНЯТЬ

- `/production`, DocStudio A4, BE schema, wipe/deploy
- Другие routes вне 4+registries read
- Массовый redesign kit / global.css ради вкуса
- Pre-existing lint baseline debt вне затронутых файлов

## КРИТЕРИИ ПРИЁМКИ

1. Audit file существует; все 4 product routes + registries reference отмечены.
2. Нет открытых FAIL без FIX или явного DEFER+reason (DEFER только если нужен BE/PO).
3. Browser evidence: Playwright smoke **или** ручной DOM assert через скрипт — в audit указать как проверял.
4. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=counterparties|orders-list|supply.page|warehouses.page
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

Baseline до CLAIM + build последним. Один agent, sequential.

## Archive

`tasks/_archive/2026-09/` + Executor report SHA ≤15 lines.
