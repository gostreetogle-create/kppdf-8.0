# TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04T21:06:19Z
closed_by: Claude (executor)
claimed_at: 2026-09-03T20:39:29Z
branch: claude/docstudio-s27
worktree: .worktrees/TZ-NX-DOCSTUDIO-S27

## verification

- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (production build, only pre-existing budget warnings)
- Focused test: `pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-data-panel studio-data-vitrina` → 1 suite, 4 tests PASS (incl. vitrina segment + grid rendering)
- Acceptance criteria (TZ): все выполнены — карточки категорий видны в панели «Данные», toggle ставит chip «N изделий» через существующий `onCatalogSelectionChange`, отдельного rail «Витрина» больше нет (orphan `studio-showcase-panel.component.ts` удалён)
- `docs/pages/document-studio.page.md` §3.3 уже описывает объединённую витрину — сверено, расхождений нет
- Foreign WIP excluded from commit: `.mcp.json`, `.mcp.json.bak`, `ORCH-HANDOFF.md`, `ORCH-PROMPT.txt` не в scope коммита

## Delivered

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts` — новый child-компонент витрины (4 категории: Изделия/Модули/Детали/Материалы, поиск, сетка `app-pi-showcase-card` size=md, реальные `photoIds`), `catalogChange` output
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts` — встроил `pi-studio-data-vitrina` сверху панели «Данные», прокинул `catalogSelections`/`catalogChange`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts` — тест на рендер сегмента + сетки витрины
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` — переключил импорт типа `StudioShowcaseKind` на `studio-data-vitrina.component`, добавил `[catalogSelections]`/`(catalogChange)` bindings к существующему `onCatalogSelectionChange` (без нового write-path)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-showcase-panel.component.ts` — удалён (orphan, заменён встроенной витриной)
- `frontend-nx/libs/data-access/src/lib/catalog/product-module.types.ts` — добавлен `ModuleRef`/`photoIds` на `ProductModule` для реальных фото модулей в витрине
