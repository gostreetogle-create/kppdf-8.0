═══════════════════════════════════════════════════════════════
TZ-PARTY-303: Counterparty FullEditor + list CRUD
═══════════════════════════════════════════════════════════════

STATUS: BLOCKED_UNTIL_301 · WAVE-PARTY-DOCS #3
DEPENDS ON: TZ-PARTY-301 DONE → тогда READY; предпочтительно после TZ-PARTY-302
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-PARTY-303.md
PAGES: /counterparties
PAGE_DOCS: counterparties.page.md (создать/обновить)

РОЛЬ: Frontend only (API уже есть)

CONFLICT KEYS:
frontend/src/app/pages/counterparties/**;
frontend/src/app/shared/services/pi-counterparty.service.ts;
docs/pages/counterparties.page.md;
docs/agent-checklists/TZ-PARTY-303.md;

---

## ИСХОДНОЕ

Страница read-only; `pi-counterparty.service` уже имеет create/update/remove.  
Site.address = адрес объекта (не дублировать legal на CP в этом TZ).

## ЧТО ДЕЛАТЬ

1. FullEditor kind C: name, inn (+ stub badge), kpp/ogrn, phone, bank, signer, roles.  
2. List: создать / редактировать / удалить (soft); колонка stub ИНН.  
3. Не слать organizationId с клиента — сервер после 301 штампует.  
4. Page doc + PAGE-TZ-INDEX.

## НЕ

- DaData  
- CP photo vault  
- Site CRUD rewrite (reuse existing if linked)  
- deploy  

## AC

1. Менеджер создаёт/правит клиента с страницы Клиенты.  
2. Stub badge виден.  
3. FE tsc + counterparties tests.  
4. Archive + push; deploy NO.
