═══════════════════════════════════════════════════════════════
TZ-DICT-316: QuickCreate dialog + wire products/modules list
═══════════════════════════════════════════════════════════════

> READY after DICT-315 · **FE QuickCreate** · RESERVED until map slot  
> Canon: audit `docs/audits/2026-08-09-quick-create-form-profiles.md`

STATUS: READY (RESERVED)

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-DICT-314 + 315 DONE (or 314 alone if hardcode seed + skip settings — prefer 315)

LAYER: 3 (shared dialog + list pages)

PAGES: `/products`, `/modules` create CTA
PAGE_DOCS: products.page.md; modules.page.md; audit 2026-08-09

CONFLICT KEYS:
frontend/src/app/shared/ui/quick-create/** (new);
frontend/src/app/pages/products/products.page.ts;
frontend/src/app/pages/modules/modules.page.ts;
frontend/src/app/shared/services/form-profiles.service.ts;
docs/agent-checklists/TZ-DICT-316.md;
progress.md;

---

## ЧТО ДЕЛАТЬ

1. `QuickCreateDialog`: loads profile `(entity, size)`; renders only visible FieldKeys
   from allowlist registry; posts same create API as FullEditor.
2. Size default **M**; optional size switcher inside dialog if cheap.
3. Wire: Products list «Добавить» → QuickCreate product; Modules list → module.
4. Edit / detail continue to use FullEditor.
5. Missing optional fields omitted from payload; locked always present.

## НЕ

- Replace FullEditor; BOM second wire unless time; material; cost/composition; deploy

## AC

- [ ] Create product/module via QuickCreate with S/M/L profiles
- [ ] Required fields always shown; API success
- [ ] tsc + jest PASS; archive

Промпт: GEMINI.md + audit + 314/315. Checklist TZ-DICT-316. Не деплой.
