═══════════════════════════════════════════════════════════════
TZ-PARTY-303: Counterparty FullEditor + list CRUD
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #3
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

## ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor executor)
protected_files:
  - frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts
  - frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.spec.ts
  - frontend/src/app/pages/counterparties/counterparties.page.ts
  - frontend/src/app/shared/services/pi-counterparty.service.ts
  - docs/pages/counterparties.page.md
verification:
  - acceptance criteria: PASS (1–4)
  - frontend typecheck: PASS в зоне (репо-дрейф в чужих spec — не из этой волны)
  - frontend development build: PASS (template typecheck)
  - frontend tests: PASS (18 — editor 8, page 6, service 4)
  - frontend lint: PASS (0 errors)
  - checklist: UPDATED (docs/agent-checklists/TZ-PARTY-303.md)
  - progress.md: UPDATED
  - docs: counterparties.page.md CREATED + PAGE-TZ-INDEX UPDATED
  - DaData / photo vault / site CRUD: NOT TOUCHED
  - deploy: NO
notes: Роли не захардкожены — читаются из `/counterparty-roles` (`description` = русская
  подпись), fallback на посеянный набор, иначе упавший справочник блокировал бы сохранение
  (`roles` обязателен в create DTO). `organizationId` с клиента не уходит — тенант штампует
  сервер после PARTY-301; на это есть тест. Правка ИНН снимает `innIsStub` на сервере, в
  редакторе только подсказка.
