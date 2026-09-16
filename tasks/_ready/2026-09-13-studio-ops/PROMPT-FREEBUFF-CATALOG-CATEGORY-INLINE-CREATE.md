# PROMPT — Freebuff: категория select + «+» в формах каталога

```
Ты executor kppdf-8.0 (Freebuff). Workspace D:\kppdf-8.0. UNATTENDED.

ЗАДАЧА: tasks/_ready/2026-09-13-studio-ops/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md
(заменяет узкий TZ-NX-MODULE-FORM-INVALID-FEEDBACK — делай оба куска: +create и invalid-текст)

1) Claim → tasks/_active/ + checklist.
2) Эталон nested create: supply-request-form-dialog openCreateMaterial.
   Эталон invalid Save: product-form-dialog buildInvalidMessage + focusFirstInvalidField.
3) CategoryFormDialog: lockType. Module/Product/Material forms: select + accent «+» → create → выбрать id.
4) Module+material invalid Save — не silent.
5) Specs + nx build kppdf-web последним. Archive + commit + push.
6) Отчёт: SHA + «+ создаёт категорию на месте».

ЗАПРЕЩЕНО: BE schema, TextBlockCategory, photo rewrite, deploy/wipe, typeahead вместо select.
```
