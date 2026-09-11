# WAVE-NX-DROP-REFERENCE-NAV — убрать «Справ.»; категории текстов → реестры

**Audit:** `docs/audits/2026-09-11-reference-nav-vs-registries.md`  
**PO:** вкладка справочников = дубль; всё в реестрах.  
**НЕ:** BE TextBlockCategory rewrite; wipe; top-nav «Справочники» для units (units = группа внутри `/registries`).

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | L | `tasks/TZ-NX-REG-TEXT-BLOCK-CATEGORIES.md` | Registry «Категории текстов» в Документы; reuse dialogs; redirect `/dictionaries/...` | DONE |
| 02 | M | `tasks/TZ-NX-NAV-DROP-REFERENCE.md` | Удалить `reference` из NAV; dead stubs; shell/specs; page.md | DONE |

**WAVE COMPLETE (2026-09-11).**

**PROMPT:** `tasks/_archive/2026-09/prompts-spent/PROMPT-CLAUDE-DROP-REFERENCE-NAV.md`  
**Очередь:** после PUT-typeahead; можно **перед или параллельно** WAVE-NX-REGISTRY-CATEGORIES (разные conflict keys; nav/text-cats ≠ catalog Category).
