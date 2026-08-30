# TZ-NX-B0-1: Paper & Ink public API gaps (secondary entries)

**РОЛЬ АГЕНТА:** executor (Freebuff / Claude CLI / Gemini)  
**ЗАВИСИМОСТИ:** TZ-NX-A2-ui-audit PASS  
**LAYER:** frontend-nx UI library  
**CONFLICT KEYS:** `frontend-nx/libs/ui/paper-and-ink/**`; `frontend-nx/tsconfig.base.json`

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `tasks/_archive/2026-08/TZ-NX-A2-ui-audit.done.md`

1. `PiThemeEditorComponent` — OnPush, но **нет** `standalone: true`; импортирует `ButtonComponent`/`CardComponent`/`BadgeComponent` через relative `../lib/*` вместо `@kppdf/ui/*` (`theme/pi-theme-editor.component.ts`).
2. Нет secondary entries / tsconfig paths для: drawer, sheet, tabs, breadcrumb, tooltip, popover, hover-card — примитивы существуют в `libs/ui/paper-and-ink/src/lib/`.
3. Root barrel `libs/ui/paper-and-ink/src/index.ts` экспортирует table + row-actions (god-barrel risk); apps используют `@kppdf/ui/table` secondary paths.
4. `type:ui` изоляция соблюдена — zero `@kppdf/util-http` / data-access.

## ЧТО ДЕЛАТЬ

1. **Claim:** `tasks/_active/TZ-NX-B0-1-ui-public-api.md` + `docs/agent-checklists/TZ-NX-B0-1-ui-public-api.md` (agent_id + claimed_at ISO).
2. **PiThemeEditor:** добавить `standalone: true`; заменить relative imports на `@kppdf/ui/button`, `@kppdf/ui/card`, `@kppdf/ui/badge`.
3. **Secondary entries** — для каждого пакета создать `index.ts` barrel + path в `tsconfig.base.json`:

| Path alias | Export surface |
|------------|----------------|
| `@kppdf/ui/drawer` | `PiDrawerService`, `DrawerComponent`, `DrawerRef`, `DrawerConfig` |
| `@kppdf/ui/sheet` | `PiSheetService`, `SheetComponent`, `SheetRef`, tokens/types |
| `@kppdf/ui/tabs` | `PiTabsComponent` (class name in file), `PiTabComponent` |
| `@kppdf/ui/breadcrumb` | `PiBreadcrumbComponent`, `PiBreadcrumbItemComponent` |
| `@kppdf/ui/tooltip` | `TooltipComponent`, `PiTooltipDirective` (or exported directive name) |
| `@kppdf/ui/popover` | `PiPopoverDirective` (+ component if separate) |
| `@kppdf/ui/hover-card` | `PiHoverCardComponent`, `PiHoverCardDirective` |

4. **God-barrel cleanup:** slim `src/index.ts` — убрать re-export table/row-actions; оставить только минимальный stub (`paper-and-ink.ts`) или пустой re-export doc comment. Убедиться что **внутри** `paper-and-ink` lib relative imports остаются допустимы; cross-subpackage внутри lib → prefer `@kppdf/ui/*` where touched.
5. **Не public:** `PiRichTextEditor`, `PiNotificationCenterService` — без entries.
6. Gates → archive → удалить active claim.

## ИЗМЕНЯТЬ

- `frontend-nx/libs/ui/paper-and-ink/**`
- `frontend-nx/tsconfig.base.json` (paths only)
- `frontend-nx/libs/ui/paper-and-ink/project.json` (only if build entry points need update)

## НЕ ИЗМЕНЯТЬ

- `frontend/**`, `backend/**`, `apps/kppdf-web/**`
- runtime-логика компонентов (только exports/imports/standalone flag)
- новые npm dependencies
- HTML/CSS примитивов
- data-access / util-http / core services imports

## КРИТЕРИИ ПРИЁМКИ

```bash
cd frontend-nx
pnpm exec nx build paper-and-ink
pnpm exec nx test paper-and-ink
pnpm exec nx run-many -t lint --all
cd ..
pnpm run architecture:check:nx
pnpm run ui:tokens:nx
```

- Все gates PASS.
- `tasks/_archive/2026-08/TZ-NX-B0-1-ui-public-api.done.md` + checklist Integrity + Executor report.
- FAIL → `TZ-NX-B0-1-ui-public-api.failed.md` с причиной.

## CLAIM

```
agent_id: <executor-id>
claimed_at: <ISO-8601>
```
