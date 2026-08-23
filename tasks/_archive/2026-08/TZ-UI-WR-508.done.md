# TZ-UI-WR-508: Fix pi-dropdown-menu TemplatePortal @for loss + migrate nav

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-wr-b
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit, only pre-existing manager-desk error from Agent A)
  - tests: PASS (pi-dropdown-menu 6/6)
  - lint: TBD (pre-commit lint-staged runs)
  - checklist: ADDED

## Что сделано

1. **DropdownMenuComponent** переписан с ng-content на `items: DropdownMenuItem[]` input.
   - @for рендерит items инлайн (без TemplatePortal/ng-content boundary)
   - `DropdownMenuItem` interface: label, icon, href, handler, disabled, separatorLabel, dataTest
   - <a routerLink> для href, <span tabindex> для handler, aria-disabled для disabled

2. **PiNavDropdownComponent** мигрирован на app-pi-dropdown-menu:
   - Инлайн-menu chrome удалён (включая комментарий-workaround про TemplatePortal)
   - `menuItems` computed конвертирует PiNavDropdownItem[] → DropdownMenuItem[]
   - MenuTriggerDirective + app-pi-dropdown-menu + ng-template #piDropdownContent

3. **Specs**: 6/6 PASS — labels, href links, disabled, separator, handler+close, empty.

## Изменённые файлы

- `frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.ts` (полный rewrite)
- `frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.spec.ts` (новый)
- `frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts` (миграция)