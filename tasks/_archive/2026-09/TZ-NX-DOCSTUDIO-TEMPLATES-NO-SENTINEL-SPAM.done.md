# TZ-NX-DOCSTUDIO-TEMPLATES-NO-SENTINEL-SPAM: «Из шаблона» без плодящихся «Пустой A4»

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx) — claude  
**ЗАВИСИМОСТИ:** audit 2026-09-12; PO не создавал шаблоны руками — в picker куча одинаковых  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio` «Из шаблона»; `/studio/templates`  
**AUDIT:** `docs/audits/2026-09-12-docstudio-list-kp-and-blank-templates-audit.md`

### Preflight Check Output
- **Context read:** `ensureBlankA4Sentinel`; `BlankA4TemplateSeed`; `BLANK_A4_SENTINEL_TAG`; findAll admin null-org; studio-template-picker; saveAsTemplate только явный dialog
- **Key Constraints:** sentinel нужен для finalize blank; в UI picker — только user templates
- **Planned Deliverable:** filter + dedup + unique; UI empty honest
- **Validation Path:** BE unit + FE picker spec; nx build / backend test

**CONFLICT KEYS:**  
`backend/src/modules/document-template/document-template.service.ts` (`findAll`, `ensureBlankA4Sentinel`) ;  
schema/index unique sentinel ;  
optional one-shot migration soft-delete duplicate sentinels ;  
`studio-template-picker-dialog.component.ts` ;  
`studio-templates-list.page.ts` ;  
`studio-list.page.ts` empty toast ;  
page.md / document-studio.md sentinel note

IMPLICIT CONFLICT: backend test; nx build kppdf-web

## РЕШЕНИЕ (PO)

В «Из шаблона» / журнале Шаблоны — **только шаблоны, которые оператор явно сохранил** («Сохранить как шаблон»).  
Системный «Пустой A4» (sentinel) **не показывать** как выбор (он не пользовательский шаблон).  
Чистый лист = **«Создать документ»**, не 9 копий sentinel.

## ЧТО ДЕЛАТЬ

1. **List API / service:** `findAll` для UI:
   - `deletedAt: null`
   - исключить `tags` containing `system-sentinel-blank-a4` (константа уже есть)
   - сохранить org scope; для admin (null org) — либо требовать org query, либо всё равно **не** отдавать sentinels в list (sentinels только ensure/finalize internal)
2. **Dedup:** migration или boot repair: на org оставить **один** sentinel с tag; лишние `deletedAt=now` (не hard wipe без PO). Unique partial index `{ organizationId, tags: sentinel }` где возможно.
3. Усилить `ensureBlankA4Sentinel`: после race — find again; не плодить.
4. FE picker: если list пуст → toast/empty «Нет сохранённых шаблонов — сохраните из студии (Шаблон → Сохранить как шаблон)», не показывать sentinel fallback.
5. Specs: ensure idempotent; findAll excludes sentinel; picker empty copy.
6. Docs: sentinel = internal; UI list = user-saved only.

## НЕ
Удалять sentinel механизм finalize; wipe всей коллекции templates; auto-save document as template on editor close.

## AC
1. Admin на чистой БД без user-templates → «Из шаблона» = empty/honest, не 9× «Пустой A4».  
2. После явного Save as template «КП цех» — одна строка в picker.  
3. Finalize blank studio doc всё ещё находит sentinel (ensure).  
4. Gates green.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend + frontend)
  - tests: PASS (backend jest — 135 suites / 1329 tests; nx test kppdf-web — 122 suites / 850 tests)
  - lint: PASS for touched files (backend eslint 0 problems; frontend nx lint 0 new issues)
  - architecture:check: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TEMPLATES-NO-SENTINEL-SPAM.md)
  - progress.md: N/A (combined entry at WAVE COMPLETE)
  - status synchronization: PASS
