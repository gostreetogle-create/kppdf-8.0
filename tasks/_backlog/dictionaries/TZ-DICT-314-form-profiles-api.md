═══════════════════════════════════════════════════════════════
TZ-DICT-314: Form profiles BE — schema + API + seed (S/M/L)
═══════════════════════════════════════════════════════════════

> READY (after DICT-313 docs-DONE) · **код BE** · RESERVED until map slot  
> Canon: `docs/audits/2026-08-09-quick-create-form-profiles.md` (D1–D8)

STATUS: READY (RESERVED)

РОЛЬ АГЕНТА: Backend

ЗАВИСИМОСТИ: TZ-DICT-313 DONE; org context / JwtAuthGuard patterns

LAYER: 2

PAGES: API only (settings UI → 315)
PAGE_DOCS: audit 2026-08-09; dictionaries.page.md (link)

CONFLICT KEYS:
backend/src/modules/form-profiles/** (new);
backend/src/app.module.ts;
docs/agent-checklists/TZ-DICT-314.md;
progress.md;

---

## ЧТО ДЕЛАТЬ

1. Schema `FormProfile`: organizationId, entity (`product`|`module`), size (`S`|`M`|`L`),
   visibleFieldKeys: string[]; unique compound index.
2. Validate: entity/size enums; every LockedRequired for entity ⊆ visibleFieldKeys.
3. API (auth + org scope):
   - GET `/api/form-profiles?entity=`
   - GET `/api/form-profiles/:entity/:size`
   - PUT `/api/form-profiles/:entity/:size` { visibleFieldKeys }
4. Seed defaults per audit §4 (product S/M/L + module S/M/L) on first GET if missing.
5. Jest: unique, required lock reject, seed idempotent.

## НЕ

- FE settings / QuickCreate (315/316)
- material entity; EAV; desktop; deploy

## AC

- [ ] CRUD + seed PASS; LockedRequired cannot be stripped (400)
- [ ] tsc + jest PASS; checklist + archive

Промпт: GEMINI.md + audit 2026-08-09 + этот TZ. Checklist TZ-DICT-314. Не деплой.
