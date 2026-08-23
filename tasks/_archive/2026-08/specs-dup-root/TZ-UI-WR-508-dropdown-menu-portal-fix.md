═══════════════════════════════════════════════════════════════
TZ-UI-WR-508: Fix pi-dropdown-menu TemplatePortal @for loss + migrate nav
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer
ЗАВИСИМОСТИ: Нет (но до любой menu adoption волны)
LAYER: 3
CONFLICT KEYS: frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.ts; frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.spec.ts; frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts; frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.spec.ts; frontend/src/app/shared/ui/menu/pi-menu-trigger.directive.ts

PAGES: shell nav
PAGE_DOCS: page-chrome.md

Проверено: pi-nav-dropdown.component.ts:134-145 — documented bypass:
  CDK Overlay TemplatePortal drops @for nodes across ng-content; panelCount=1,
  menuItems=[]. pi-dropdown-menu — 0 real consumers.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Characterization test
Воспроизвести баг: dropdown-menu + @for menuitems через overlay → 0 items.
Тест RED → фиксируем.

ШАГ 2 — Fix root cause
Предпочтительные варианты (выбрать минимальный):
A. Не использовать ng-content select через portal — принимать TemplateRef input;
B. Рендерить items в том же view, что и portal template (как сейчас nav);
C. Attach ComponentPortal вместо TemplatePortal для menu host.
Канон после фикса: **pages используют app-pi-dropdown-menu**, не copy chrome.

ШАГ 3 — Migrate PiNavDropdown на fixed primitive; удалить inline menu chrome
  и комментарий-workaround.

ШАГ 4 — Specs green; browser nav dropdown shows items.

НЕ: redesign nav IA; не трогать notification-bell menu отдельно если не нужно.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Characterization → regression test PASS с @for items visible.
2. PiNavDropdown imports/uses pi-dropdown-menu (или shared item host).
3. FE tsc + jest menu specs + lint.
4. Manual: top nav category with children opens non-empty menu.

Finalization: archive + Executor report (auto).
