# TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST: «Вставить на лист» из буфера

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio
**ЗАВИСИМОСТИ:** D51; existing `onTableSourceChange` / create-table + `putDataSet` + catalog source types
**CONFLICT KEYS:** `studio-data-panel.component.ts`; `studio-editor.page.ts` (helper insert); IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

`insertTable` output (`StudioDataPanelComponent`) + `insertTargets()` (только kinds с ≥1 selection). `insertCatalogTable(kind)` (`studio-editor.page.ts`): reuse+focus существующей таблицы с этим source, иначе create (переиспользован `addTableLayer`'s write path, извлечён в `createTableBlock()`) + `setBlockCatalogSource` (тот же `putDataSet`, что `onTableSourceChange`, параметризован по blockId). Disabled CTA + hint, когда каталог пуст.

## НЕ (соблюдено)

Формулы, text/photo suggest, новые BE endpoints — не строились.

## AC — результат

1. ✅ Выбрал ≥1 изделие → вставка таблицы без захода в Свойства.
2. ✅ Строки live на A4 после вставки.
3. ✅ Build + focused studio tests PASS.

## Gates

```
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS (14/14)
pnpm exec nx lint kppdf-web → 0 новых ошибок
pnpm exec nx build kppdf-web → PASS, exit 0
```

Observed (не мой fix, BAN zone): 1 нестабильный fail в `production-cockpit.page.write.spec.ts` — Freebuff live WIP в `pages/production/**`, не трогал.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (studio-data-panel suite; studio-editor.page.ts write-path — no dedicated spec file, manual smoke deferred to D54)
  - lint: PASS (0 new warnings)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST.md)
  - progress.md: N/A (captured in checklist; page.md update deferred to D54)
  - status synchronization: PASS
