═══════════════════════════════════════════════════════════════
TZ-DICT-315: Form profiles settings UI (Справочники)
═══════════════════════════════════════════════════════════════

> READY after DICT-314 · **FE settings** · RESERVED until map slot  
> Canon: audit `docs/audits/2026-08-09-quick-create-form-profiles.md`

STATUS: READY (RESERVED)

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-DICT-314 API live

LAYER: 2

PAGES: `/dictionaries/form-profiles`
PAGE_DOCS: docs/pages/dictionaries.page.md (or form-profiles.page.md)

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/form-profiles.page.ts;
frontend/src/app/pages/dictionaries/** (nav/routes only as needed);
frontend/src/app/shared/services/form-profiles.service.ts;
docs/pages/dictionaries.page.md;
docs/agent-checklists/TZ-DICT-315.md;
progress.md;

---

## ЧТО ДЕЛАТЬ

1. Page under Справочники: entity overflow-select → tabs/chips S|M|L →
   checkbox matrix of FieldKeys (locked required disabled+checked).
2. Save → PUT API; toast on error; RU labels from allowlist.
3. Wire nav/group chip per DICT IA (не ломать Group Chip chrome).
4. Empty/error states: куда кликнуть.

## НЕ

- QuickCreate wire (316); change FullEditor; appearance colors; deploy

## AC

- [ ] Can edit product+module × S/M/L; cannot uncheck locked
- [ ] tsc + jest (page/service) PASS; docs; archive

Промпт: GEMINI.md + audit + DICT-314. Checklist TZ-DICT-315. Не деплой.
