# TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL: TOC категорий в панели «Данные»

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 2
**PAGES:** document-studio
**PAGE_DOCS:** `docs/pages/document-studio.page.md`
**ЗАВИСИМОСТИ:** S41 vitrina; audit `docs/audits/2026-09-05-docstudio-data-panel-ia-audit.md`
**CONFLICT KEYS:** `studio-data-panel.component.ts`; IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

TOC row (`activeCategory` signal, 5 категорий: Товары | Выбрано | Кому | Связи | Ещё) + `@switch` секций внутри `StudioDataPanelComponent`. Механический разрез существующих полей: Товары = vitrina (не тронута); Выбрано = anchors+catalog chips; Кому = Клиент+Плательщик; Связи = КП+Статус КП+Заказ; Ещё = Поставщик + read-only Исполнитель. `context` API / catalog write-path не менялись — только видимость.

## AC — результат

1. ✅ 5 категорий видны; по умолчанию Товары.
2. ✅ Переключение не ломает Add/Remove витрины.
3. ✅ Build PASS.

## Gates

```
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS
pnpm exec nx lint kppdf-web → 0 ошибок
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL.md)
  - progress.md: N/A (captured in checklist; page.md update deferred to D54 per wave plan)
  - status synchronization: PASS
