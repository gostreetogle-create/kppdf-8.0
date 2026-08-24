# NOW — оперативная доска агента (короткий срез)

> Правда для resume. Лимит: 120 строк. Журналы: `progress.md`, не читать целиком.

updated_at: 2026-08-24T23:45:00+03:00

## ACTIVE — WAVE-PO-SMOKE

**DONE локально (2026-08-24):** BIND-513…PHOTO-304 + PLUS-605 + **SUPPLY-431** (3-col quick order UX).
Archive: `tasks/_archive/2026-08/TZ-SUPPLY-431-supply-quick-order-ux-redesign.done.md`

**NEXT PO:** live smoke §1–5 → commit/push/deploy по команде.

**READY executor:** следующая задача из `tasks/QUEUE-LIVE.md`.

## ACTIVE — DEPLOY

**READY** (см. `docs/agent-checklists/DEPLOY-READY.md`). PO: «деплой по документации».

## Корень tasks/ (канон)

| Оставить в корне | Зачем |
|------------------|-------|
| `README.md`, `QUEUE-LIVE.md` | указатель + очередь |
| `PROMPT-RESUME-ANY.md`, `PROMPT-FOLLOW-QUEUE.md`, `PROMPT-UNIVERSAL-CONTINUOUS.md`, `PROMPT-DEPLOY-READY.md` | executor |
| `TZ-AUDIT-MGR-530-manager-journey-audit.md` | живой smoke checklist |
| `WAVE-UI-DENSITY-PAPER-INK.md` | wave doc |

**Нет** spent TZ/PROMPT в корне — только `_archive/`.

## Dev smoke (не угадывать bundle)

1. `npm run start:no-browser` → пишет `build-info.ts`, badge **local · &lt;sha&gt;** справа снизу
2. КП → Клиент → `[data-test="kp-recipient-contact-add"]` — зелёный + в одной строке (`app-pi-select-add-row`)
3. `/supply?view=quick` — §4.1–4.7 (3-col, autofill, org promote)
4. FAIL → thin TZ, не «может рестарт»

---

## Справка (DONE, не active)

- **KP IA-510/511** — archived `TZ-KP-IA-510.done.md`, `TZ-KP-IA-511.done.md`
- **KP WS 401–409** — wave closed; `/proposals/create` = workspace
- **UI Density** — wave closed; PO sign-off `UI-DENSITY-GUARDS.md`
- **DESK 425–430** — archived
- **SUPPLY 316/317/308R** — archived
- **PLUS-604** — archived

deploy_docs: `deploy/synology/README.md`
