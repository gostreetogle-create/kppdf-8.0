# NX UX smell audit — `/registries` (GOLD verify)

**TZ:** `TZ-NX-UX-03-registries-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 03
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Note:** this route **is** the gold reference every prior wave (#00–#02) was compared
against — this audit checks the gold against its own checklist, "polish only if smell."
**Page source:** `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts` (295 lines),
`registry-detail-panel.component.ts` (443 lines), `registry-row-action-button.component.ts`,
`registry-toolbar-pagination.component.ts`, `registry-create-button.component.ts`,
`registry-action-icons.ts`. (`data/*.registry.ts` per-entity field/action definitions —
~30 files — out of scope: they configure data, not the shared UX shell this checklist audits.)
**Route:** `app.routes.ts` → `registries` (`registries.routes.ts`, single `UrlMatcher` for
`/registries` and `/registries/:registryKey`, same component instance — TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE).

## Что это за страница

Master table (`RegistriesPage`) grouped by category → click a row → inline expand mounts
`RegistryDetailPanelComponent` (query-state ↔ URL, loading/error/retry, filters, sortable
paginated table, row actions, create). This is the literal origin of the "expand + pi-button"
pattern named as the эталон in every other wave's canon/prompt text.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Таблица: нет expand / клик ничего не даёт | **OK** | Master table `[expandedRow]`/`[expandedRowWhen]`/`(rowClick)` `registries-page.ts:118-129`; detail table itself also supports its own `[expandedRow]` for row-level fields (`registry-detail-panel.component.ts:194-199`) when `definition().expandable` is set |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `pageState()` drives `loading`/error banner with «Повторить» retry (`registry-detail-panel.component.ts:168-177`) and `emptyMessage` per-registry (`:193`); master table has its own empty state (`registries-page.ts:133-141`, «Реестры не найдены») |
| A1 | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **OK** | Row actions are real `<button>` via `RegistryRowActionButtonComponent` (`pi-icon-btn` + tone class + `pi-focus-ring`); create action via `RegistryCreateButtonComponent` (same pattern); no `<a>` styled as an action anywhere in the shell |
| A2 | Destructive без confirm | **OK** | `onRowAction` `registry-detail-panel.component.ts:352-372` — when `action.confirm` is set, opens `AlertDialogComponent` (`variant: 'destructive'` for `action.destructive`) via `PiDialogService`, runs the action only on confirmed close (`runOnDialogCloseOnce`). This is the exact pattern copied into `/kit/forms` and `/kit/overlays`' documentation this wave — it originates here |
| F1 | Фильтры: поле без `pi-label` / голый native select | **OK** | Filter label is a `<span [id]>` linked via `[attr.aria-labelledby]` on the input/select (`registry-detail-panel.component.ts:113-140`) — not the `.pi-label` CSS class or `<app-pi-label>` component, but this is a **deliberate, tested** a11y pattern: `registries-a11y.spec.ts:124-145` explicitly asserts the labelledby wiring and label text. Functionally equivalent (proper accessible name, visible caption), just a different implementation than `FormFieldComponent`'s `<app-pi-label>` — not a comprehension/discoverability smell |
| F2 | Фильтры: нет сброса чипа deep-link | **OK** | No chip widget, but filter inputs/selects are two-way bound straight to URL query state (`filterInputValue`/`onFilterChange`, `:298-301,322-328`) — clearing the text input or picking the empty option (`Все`) removes the filter from the URL immediately. The underlying capability (reset a deep-linked filter) is present and visible, just via the control itself rather than a separate chip |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | No dropdown-menu overlay on this page (filters use native `<select>` per canon's own documented fallback, not a DropdownMenu use case) |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `px-panel-inset` shell padding, `gap-form-field`/`gap-8` between groups, `p-4` in expanded-row grid — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **N/A** | No validated forms on this page (dialogs are separate routed/lazy components out of this TZ's page scope) |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | All UI copy RU (`Реестры`, `Без фильтров`, `Все`, `Не удалось загрузить данные.`, `Повторить`, `Предыдущая/Следующая страница`, `Строк на странице`, RU pluralization helper `pluralizeRecords` for record counts); `API`/`Демо` badge text is a standard technical abbreviation, not competing-language UI copy; no dead buttons — every button has a real handler wired through `RegistryActionContext` |

## Что уже ок (не чинить)

- This page IS the origin of the "expand + pi-button" pattern named as gold in every other wave's TZ text — confirms it holds up under its own bar.
- Deliberate `RouteReuseStrategy` fix (`registries.routes.ts`, `TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE`) keeps the master table alive across expand/collapse — scroll position restored (`restoreRegistryScrollPosition`).
- Destructive-confirm pattern (`AlertDialogComponent` + `PiDialogService` + `onDialogCloseOnce`-equivalent) is the one this wave's #01/#02 fixes were modeled on.
- Toolbar pagination always visible once there's data, even a single page (`TZ-NX-REGISTRIES-TOOLBAR-FINALIZE`) — consistent affordance, no surprise disappearing pager.
- `registries-a11y.spec.ts` + `registry-row-action-button.component.spec.ts` + `registry-toolbar-pagination.component.spec.ts` give this shell dedicated a11y/behavior test coverage that no other audited page in this wave has yet — genuinely hardened, not just visually similar.

## Verdict

**PASS-EMPTY** — no P0/P1/P2 found. Every checklist row is OK or legitimately N/A; the two
borderline items (F1 label-implementation choice, F2 no separate chip widget) are deliberate,
tested design decisions that satisfy the underlying requirement (labelled fields, resettable
filters) through a different but equally valid mechanism — not comprehension or a11y gaps. FIX
TZ (`TZ-NX-UX-03-registries-FIX`) — **skip**, WAVE row 03 marked DONE with FIX N/A.
