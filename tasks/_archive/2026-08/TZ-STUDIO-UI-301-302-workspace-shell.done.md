# TZ-STUDIO-UI-301 / TZ-STUDIO-UI-302 — Workspace shell + Pi panels DONE

> Archived: 2026-08-29 · UI audit closeout

## Delivered

### TZ-STUDIO-UI-301 — Chrome + ribbon
- `studio-workspace-chrome.ts` — 6 rail sections via `PiChromeToolsService` (desktop parity with KP geometry law §5)
- `studio-ribbon.component.ts` — `app-pi-tabs` Редактор/Просмотр + PDF/В архив (`kpWsRibbonExtra` / `kpWsRibbonActions`)
- `document-studio-workspace.styles.css` — ribbon consumer styles (KP parity)

### TZ-STUDIO-UI-302 — Panels + orchestrator
- `document-studio-editor.page.ts` (136 lines) + `document-studio-editor.page.html` — thin orchestrator
- `document-studio-editor.facade.ts` — business logic extracted from monolith page
- Pi panels: elements, layers, properties, data, table, template (`app-pi-button`, `app-pi-select`, `app-pi-switch`, `app-pi-form-field`, `app-pi-input`, `app-pi-textarea`)
- `studio-table.helpers.ts` — shared table/layout helpers

## Gates

- `frontend tsc` PASS
- `frontend lint` PASS (studio scope)

## Manual smoke (PO)

1. Открыть `/doc-constructor/studio/:id` на desktop — rail в Pi-chrome (6 иконок), не в скрытом shell-rail
2. Ribbon: вкладки Редактор/Просмотр + отдельные кнопки PDF и В архив
3. Панели: Элементы / Слои / Данные / Шаблон / Свойства / Таблица — без сырого `<select>`/`<checkbox>` в новых компонентах

## Note

Backend + prior studio waves remain **uncommitted WIP** on branch; this archive covers frontend UI refactor only.
