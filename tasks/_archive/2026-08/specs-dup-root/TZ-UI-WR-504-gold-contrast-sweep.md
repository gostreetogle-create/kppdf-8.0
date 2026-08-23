═══════════════════════════════════════════════════════════════
TZ-UI-WR-504: Gold / on-gold contrast verify + fix
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет
LAYER: 3
CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts; frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts; frontend/src/app/shared/page/pi-group-workspace.component.ts; frontend/src/app/pages/supply/supply.page.ts; frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts; frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts; frontend/src/app/pages/inventory/stock-movements.page.ts

PAGES: shell + supply + orgs + counterparties + stock-movements
PAGE_DOCS: N/A

Проверено 2026-08-23: app-layout и pi-nav-dropdown **уже** `text-on-gold` на
  active gold. C-02 select-option FIXED TZ-UI-401. Нужен verify остальных
  audit sites + любой `bg-sunrise-warm` без `text-on-gold`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Inventory
Для каждого CONFLICT KEY: если active/selected использует `bg-sunrise-warm`
или `bg-gold`, текст обязан `text-on-gold` / `text-ink` по канону DARK-THEME,
**не** `text-paper`.

ШАГ 2 — Fix только реальные нарушения
Не трогать файлы, где уже корректно (отметить в checklist evidence).

ШАГ 3 — Guard
Добавить/обновить 1 Jest или static AC: запрещённый паттерн
`bg-sunrise-warm` + `text-paper` в тех же class bindings (где возможно).
Либо scoped `rg` в AC как verification command с expected 0 hits на listed files.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Evidence table: file → OK | FIXED.
2. FE tsc + lint + focused specs затронутых страниц.
3. Dark theme smoke: active nav gold — читаемый контраст.

НЕ ИЗМЕНЯТЬ: select-option (уже DONE); badge defaults без нужды.
Finalization: archive + Executor report (auto).
