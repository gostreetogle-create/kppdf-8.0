═══════════════════════════════════════════════════════════════
TZ-SALES-310: Сделки — TOC КП/Договоры/Заказы + подchips Создать КП | Все КП
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #1
DEPENDS ON: нет
LAYER: 3
PAGES: /proposals ; /proposals/create ; /contracts ; /orders
PAGE_DOCS: proposals.page.md ; contracts.page.md ; orders.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-310.md

РОЛЬ: Frontend (IA / PiGroupWorkspace)

CONFLICT KEYS:
frontend/src/app/pages/commercial/deals-group-chips.ts;
frontend/src/app/pages/commercial/proposals/proposals.page.ts;
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts;
frontend/src/app/app.routes.ts;
frontend/src/app/pages/contracts/contracts.page.ts;
frontend/src/app/pages/orders/orders.page.ts;
docs/pages/proposals.page.md;
docs/pages/proposals-create.page.md;
docs/pages/contracts.page.md;
docs/pages/orders.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-SALES-310.md;

Проверено: `pi-group-workspace` — TOC = тёмный ряд (`bg-ink`), chips = жёлтый
(`bg-sunrise-warm`); сейчас `DEALS_SECTION_CHIPS` сидят в жёлтом ряду; словарь
уже использует toc+chips. Entity КП = Quotation; клиент Counterparty; бланк Organization.

---

## ИСХОДНОЕ

1. Сделки: три жёлтых chip КП|Договоры|Заказы — PO хочет их **тёмным TOC**.
2. Под КП нужны жёлтые: **Создать КП** | **Все КП**.
3. Маршрута `/proposals/create` нет; список = `/proposals`.

---

## ЧТО ДЕЛАТЬ

1. В `deals-group-chips.ts` (или рядом):
   - `DEALS_TOC_CHIPS`: КП → `/proposals` (или create — см. п.3), Договоры, Заказы;
   - `KP_SECTION_CHIPS`: Создать КП → `/proposals/create`, Все КП → `/proposals`;
   - pageKey как сейчас (`proposals` / `contracts` / `orders`).
2. Роут lazy: `/proposals/create` → **stub page** (заголовок «Создать КП» + workspace chrome), полный UI = 312.
3. Default заход в раздел КП: **Все КП** (`/proposals`) — список не ломать.
4. На `proposals.page` (Все КП) и stub create: `[toc]="DEALS_TOC"` `tocActiveId="proposals"` + жёлтые `KP_SECTION_CHIPS` с верным `activeId`.
5. На contracts/orders: тот же TOC; жёлтый ряд — **пустой массив** ИЛИ один нейтральный chip раздела (предпочтительно **пустой** chips + не ломать layout workspace; если пустые chips дают дыру — один chip «Договоры»/«Заказы» active без навигации-дубля). Зафиксировать в page doc.
6. pathLabel «Сделки» где уместно.
7. Обновить proposals/contracts/orders page docs + PAGE-TZ-INDEX.
8. Jest: chips config / page renders toc+подchips (focused).

---

## НЕ

- Не строить 3-колоночную витрину (312).
- Не family expand (313).
- Не менять quotation API.
- Не deploy.

---

## AC

1. На `/proposals` и `/proposals/create` видны тёмный TOC (КП active) и жёлтые «Создать КП» | «Все КП».
2. Клик «Создать КП» → `/proposals/create` (stub ок).
3. `/contracts` и `/orders`: TOC с верным active; нет ложных жёлтых «Создать КП».
4. Solo list «Все КП» по-прежнему грузит КП.
5. `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit`
6. Focused jest на затронутые pages/chips.
7. Archive + commit/push + Checkpoint NEXT=311 (и 313 можно claim параллельно).

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-310.done.md`
