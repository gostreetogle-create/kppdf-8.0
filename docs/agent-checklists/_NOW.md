# NOW — оперативная доска агента (короткий срез)

> Правда для resume. Лимит: 120 строк. Журналы: `progress.md`, не читать целиком.

updated_at: 2026-08-25T18:45:00+03:00

## ACTIVE — WAVE UX-HYGIENE-440

**READY** — Freebuff: `tasks/PROMPT-FREEBUFF-UX-HYGIENE-440.md`  
DESK-440 · SHIP-440 · UX-440 · audit `docs/audits/2026-08-25-ux-hygiene-sweep.md`

DESK-440: **код + specs зелёные, pushed**; live `/desk` PASS + archive — ждут Cursor/PO review handoff  
SHIP-440 · UX-440: параллельные Freebuff-сессии (свои conflict keys)

## ACTIVE — DEPLOY (после 440 PASS)

**READY** @ `565c630d` — `docs/agent-checklists/DEPLOY-READY.md`  
PO: «сделай деплой по документации» (VPN off, warm, no wipe).

## Корень tasks/ (канон)

| Оставить в корне | Зачем |
|------------------|-------|
| `README.md`, `QUEUE-LIVE.md` | указатель + очередь |
| `PROMPT-*`, `PROMPT-FREEBUFF-UX-HYGIENE-440.md` | executor |
| `TZ-DESK-440-*`, `TZ-SHIP-440-*`, `TZ-UX-440-*` | LIVE wave |
| `TZ-AUDIT-MGR-530-*`, `TZ-CATALOG-377-*` | smoke / next |
| `WAVE-UI-DENSITY-PAPER-INK.md` | wave doc |

Spent → `_archive/` после DONE.

## Dev smoke (не угадывать bundle)

1. `npm run start:no-browser` → badge **local · &lt;sha&gt;**
2. `/desk` tray: нет «подключится позже»; на ready один ship control
3. `/shipping`: склад = select, не ObjectId
4. Supply / people: «Почта…»; KP review без `productName` chips
5. FAIL → thin TZ, не «может рестарт»

---

## Справка (DONE, не active)

- **KP IA-510/511** — archived `TZ-KP-IA-510.done.md`, `TZ-KP-IA-511.done.md`
- **KP WS 401–409** — wave closed; `/proposals/create` = workspace
- **UI Density** — wave closed; PO sign-off `UI-DENSITY-GUARDS.md`
- **DESK 425–430** — archived
- **SUPPLY 316/317/308R** — archived
- **PLUS-604** — archived

deploy_docs: `deploy/synology/README.md`
