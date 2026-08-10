═══════════════════════════════════════════════════════════════
TZ-SALES-302: КП immutable versions on send/fix (D17)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #4
DEPENDS ON: TZ-SALES-303 DONE (family schema exists; versions ≠ family UI)
LAYER: 2–3
CHECKLIST: docs/agent-checklists/TZ-SALES-302.md

РОЛЬ: Backend quotations + тонкий FE кнопка «Зафиксировать / Отправить»

CONFLICT KEYS:
backend/src/modules/quotation/**;
frontend/src/app/pages/commercial/**;
docs/agent-checklists/TZ-SALES-302.md;

Canon: sales-to-shop D17 — при отправке/фиксации immutable snapshot; edit → новая версия.
НЕ трогать SALES-304 family expand UI (RESERVED).

Проверено: quotation familyRole/familyVersion; convert flows.

---

## ИСХОДНОЕ

Нет immutable «что отправили клиенту»; правки затирают историю.

## ЧТО ДЕЛАТЬ

1. Модель версий: коллекция `quotation_versions` или embedded snapshots  
   `{ quotationId, version, frozenAt, frozenBy, payload: lines+totals+meta }`  
2. `POST /quotations/:id/freeze` (или `/send`) — пишет snapshot, bumps visible version,  
   помечает current как editable draft поверх.  
3. `GET /quotations/:id/versions` — список; GET one snapshot read-only.  
4. FE: кнопка «Зафиксировать версию» + простой список версий (без family dialog).  
5. Delete не-сконвертированного КП — оставить как сейчас / не ломать.

## НЕ

SALES-304 family UI; Order convert rewrite; desktop; supply.

## AC

1. freeze → versions.length+1; snapshot неизменяем PATCH.  
2. После freeze правка lines не меняет старый snapshot.  
3. FE показывает ≥1 версию после freeze.  
4. Gates: quotation tests + tsc.

known_limitation: email/PDF send outbox — later.
