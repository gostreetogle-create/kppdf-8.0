# TZ-NX-A2-ui-audit — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-orchestrator

## Scope

Analysis-only audit of `frontend-nx/libs/ui/paper-and-ink/**`.
No product code changed.

## Component audit table

| component | public path | status | blocker | recommendation |
|-----------|-------------|--------|---------|----------------|
| ButtonComponent | `@kppdf/ui/button` | PASS | — | Canonical; standalone + OnPush |
| CardComponent | `@kppdf/ui/card` | PASS | — | Also exports PiShowcaseCard |
| PiDialogComponent / PiAlertDialog / PiDialogService | `@kppdf/ui/dialog` | PASS | — | Tokens + types exported |
| TableComponent / PiRowActionsComponent | `@kppdf/ui/table` | PASS | — | ColumnDef types exported |
| ThemeService / ThemeEditorService / PiThemeEditor | `@kppdf/ui/theme` | PARTIAL | — | PiThemeEditor missing `standalone: true` (OnPush OK); uses relative imports to button/card/badge instead of `@kppdf/ui/*` |
| PiToastComponent / PiToastService | `@kppdf/ui/toast` | PASS | — | No HttpClient; uses PiNotificationCenterService internally |
| InputComponent | `@kppdf/ui/input` | PASS | — | Secondary entry matches tsconfig path |
| SelectComponent | `@kppdf/ui/select` | PASS | — | inject() for overlay deps |
| FormFieldComponent | `@kppdf/ui/form-field` | PASS | — | |
| CheckboxComponent | `@kppdf/ui/checkbox` | PASS | — | |
| BadgeComponent | `@kppdf/ui/badge` | PASS | — | |
| AvatarComponent | `@kppdf/ui/avatar` | PASS | — | |
| PiPageHeader / PiSection / PiDemo | `@kppdf/ui/page` | PASS | — | Kit shell primitives |
| PiTableTreeComponent | `@kppdf/ui/table-tree` | PASS | — | Direct component path (no index barrel) |
| PiRowActionsComponent | `@kppdf/ui/row-actions` | PASS | — | Also re-exported from table |
| DropdownMenuComponent | `@kppdf/ui/dropdown-menu` | PASS | — | |
| PiStatusBannerComponent | `@kppdf/ui/status-banner` | PASS | — | |
| PiDrawerComponent / PiSheetComponent | *(none)* | GAP | — | No tsconfig secondary entry; not in public API |
| PiTabs / PiTab / PiAccordion | *(none)* | GAP | — | Internal-only; add `@kppdf/ui/tabs` etc. when kit needs them |
| PiBreadcrumb | *(none)* | GAP | — | Not exported via path alias |
| PiTooltip / PiPopover / PiHoverCard | *(none)* | GAP | — | Directive-only; no public entry yet |
| PiRichTextEditor | *(none)* | GAP | — | Heavy primitive; intentionally internal |
| PiNotificationCenterService | *(none)* | INTERNAL | — | Used by toast; not part of public API (by design) |

## Cross-cutting checks

| Check | Result |
|-------|--------|
| `@kppdf/util-http` imports | PASS — zero matches in paper-and-ink |
| `@kppdf/data-access` / HttpClient | PASS — zero in production code |
| ThemeService | PASS — `theme.service.ts` exported via `@kppdf/ui/theme`; toggles `<html class="dark">` |
| Raw colors | PARTIAL — `global.css` defines token fallbacks with hex/rgb (canonical token layer); no raw colors in component TS |
| Standalone | PARTIAL — 63/64 components standalone; only `PiThemeEditor` lacks `standalone: true` |
| OnPush | PASS — all 64 `.component.ts` files use `ChangeDetectionStrategy.OnPush` |
| inject() vs constructor | PASS — services use inject(); 4 components use empty `constructor()` for DI side-effects (toast, select, overflow-select, rich-text) |
| Secondary entries vs tsconfig | PASS — 28 index barrels; 30 path aliases in `tsconfig.base.json` align |
| Root barrel `@kppdf/ui` | MINIMAL — exports only PaperAndInk stub + table + row-actions; apps use secondary paths (correct) |

## Auditor report

Paper & Ink is architecturally clean for `type:ui`: no HTTP/data-access leakage, ThemeService isolated, requested exports (button/card/dialog/table/theme/toast) all functional with matching tsconfig paths. Non-blockers: PiThemeEditor not standalone; several mature primitives lack secondary entries (drawer/sheet/tabs). **Outcome: PASS.**

## Checklist

See `docs/agent-checklists/TZ-NX-A2-ui-audit.md` — Integrity slot filled, status DONE.
