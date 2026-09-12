# TZ-NX-PO-SWEEP-07 checklist — studio chrome-rail «Документ» category

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-07-studio-chrome-rail-categories.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — только этот TZ
- [x] TZ + audit прочитаны

### Preflight Check Output
- **Context read:** audit 2026-09-12 (10 flat right rail ids, 5 lifecycle + 5 panel); `shell-tool-rail.service.ts` (`ShellToolRailItem` flat, no children API); `app-shell.component.ts` (rail render loop, `onShellToolClick`→`invoke`→`tool.onClick()`); `studio-editor.page.ts` setTools right array (5 lifecycle items); `studio-editor-chrome-ia.spec.ts` (asserts flat ids + per-id `rightTool()` lookups)
- **Key Constraints:** left rail untouched; panel categories (elements/layers/pages/properties/template) unchanged; generic API (`items` optional) must not break `production-cockpit.page.ts`'s existing flat `setTools` usage; A4 geometry untouched (chrome-only change)
- **Planned Deliverable:** `ShellToolRailItem.items?: ShellToolRailMenuItem[]` (onClick now optional) + `AppShellComponent` popover (open/close via click/outside/Escape, only right-rail template touched) + studio `document` category replacing 5 flat lifecycle ids
- **Validation Path:** shell-tool-rail service is a pure type/service change (no spec of its own); `app-shell.component.spec.ts` (+7 popover tests); `studio-editor-chrome-ia.spec.ts` rewritten for the new shape; full FE suite; `nx build kppdf-web` last

## Acceptance (из TZ)

- [x] В студии справа нет пяти отдельных lifecycle-иконок подряд — одна категория «Документ»
- [x] «Документ» открывает меню с 5 пунктами (Редактор/Просмотр/Сохранить/PDF/В архив)
- [x] Панельные категории (Элементы…Шаблон) по-прежнему открывают flyout — не тронуты
- [x] Specs + `nx build kppdf-web` green

## Integrity slot

- [x] Тип изменения: page (studio) + shared layout (`app-shell`, `shell-tool-rail.service` — generic API, opt-in via `items`)
- [x] FIC / DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (chrome IA, не новый route/permission)
- [x] page.md: `docs/pages/document-studio.page.md` §1.3 обновлён (rail IA + `ShellToolRailItem.items` упомянут)
- [x] Чужой WIP не в коммите

## Gates (факт)

- `frontend: nx test kppdf-web` (full) → PASS 836/843 (7 skipped) — app-shell +7, chrome-ia rewritten (net stable count, all green)
- `frontend: nx build kppdf-web` → PASS (bundle budget warning 3.11→3.27kB, negligible; same pre-existing NG8102/gantt-bars warnings)

## Executor report

- **`shell-tool-rail.service.ts`:** new `ShellToolRailMenuItem` (`id,label,icon?,active?,disabled?,onClick`); `ShellToolRailItem.items?: readonly ShellToolRailMenuItem[]` (non-empty → category/menu slot) + `onClick` now optional (only required for a plain action slot). `invoke()` uses `tool.onClick?.()` — backward compatible, no other page (`production-cockpit.page.ts`) needed changes.
- **`app-shell.component.ts`:** new `openMenuFor` signal; `onShellToolClick(tool)` branches — `items.length>0` toggles the popover (doesn't call `invoke`), otherwise unchanged `shellTools.invoke(tool)`. New `onMenuItemClick(item)` calls the item's `onClick` then closes. `@HostListener('document:click')`/`('document:keydown.escape')` close the menu (outside-click ignores clicks inside `.shell-rail-item`, matching the TZ-NX-PO-SWEEP-03 outside-click pattern from earlier in this wave). **Left rail template untouched** — only the right-rail `@for` loop got the wrapping `.shell-rail-item` + conditional `.shell-rail-menu` popover.
- **`studio-editor.page.ts`:** the 5 flat `mode-editor`/`mode-preview`/`save`/`pdf`/`archive` rail entries collapsed into one `document` category (icon: lucide `File`, aliased `DocumentIcon`) with those 5 as `items`. Their own `active`/`disabled`/`onClick` logic is unchanged, just nested one level. No top-level `active` set on `document` — the category highlights only when its own menu is open (`AppShellComponent`'s own `openMenuFor` check), matching audit's "Active: при открытом меню".
- **Specs:** `studio-editor-chrome-ia.spec.ts` rewritten — right rail ids now `['document','elements','layers','pages','properties','template']`; new `documentMenuItem(id)` helper reads `rightTool('document').items`. `app-shell.component.spec.ts` +7 tests (menu opens/closes, item click invokes+closes, disabled item no-op, outside-click close, Escape close, toggle-closed on re-click, plain action tool unaffected).
- **Docs:** `docs/pages/document-studio.page.md` §1.3 updated (rail IA description + `ShellToolRailItem.items` generic-API note).
- Not touched: left rail (Данные/Выбрано), panel categories' own behavior, A4 geometry, `production-cockpit.page.ts` (still flat actions, no `items` — API is opt-in).

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
