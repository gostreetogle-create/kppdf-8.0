# TZ-UX-316 DONE — «Редактировать шаблон» → /builder/:id + returnUrl

```
ARCHIVE_MARKER
task: TZ-UX-316
outcome: DONE
closed_at: 2026-08-12
closed_by: agent-158a657202 (freebuff/wave-nav-return)
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (picker 2/2 + builder.page 29/29)
  - lint: PASS (ESLint, Prettier)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
```

- `openBuilder()` в `proposal-create-template-picker.component.ts`: из Create «Редактировать шаблон»
  ведёт в живой редактор `/doc-constructor/builder/:id` с `queryParams.returnUrl` = текущий
  Create path (вкл. query id черновика), а **не** на список `/templates?templateId=` (там query не читался).
- Builder «←» (`builder.page.ts`): при валидном same-origin `?returnUrl` → `navigateByUrl(returnUrl)`,
  label «← К созданию КП»; без `returnUrl` → `CatalogReturnStore.navigateBackOr('/doc-constructor/templates')`,
  label «← Шаблоны». Валидация: только absolute same-origin path (без `//host`, без схемы).
- Спека: новый `proposal-create-template-picker.component.spec.ts` (2 теста: deep-link + no-op);
  `builder.page.spec.ts` — 4 теста TZ-UX-316 (fallback CatalogReturnStore, returnUrl, label, unsafe-url rejection).
- Docs: `proposals-create.page.md` (строка 316) + `builder.page.md` (query param returnUrl + кнопка «←»).
- `proposal-create.page.ts` не тронут; gutter-канон (317) не переписывался; TZ-SALES-368 WIP в canonical
  (page.ts + proposals-create.md «Вывод») не пересекался — мои md-правки аддитивные.
- Gates: FE tsc PASS (0 errors); Jest picker+builder.page 31/31 PASS; ESLint/Prettier/diff-check PASS.
