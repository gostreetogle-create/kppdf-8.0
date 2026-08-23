# TZ-KP-WS-401: ProposalWorkspaceShellComponent (из demo)

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-400 DONE (rail IA doc exists)  
**LAYER:** frontend/shared or proposals  
**WAVE:** `WAVE-KP-SINGLE-WORKSPACE` #1  
**PAGES:** `/proposals/demo-workspace` ; `/proposals/workspace` (new, admin)  
**PAGE_DOCS:** `kp-workspace-geometry.md` ; `kp-workspace-rail-ia.md`  
**CONFLICT KEYS:** `frontend/src/app/pages/commercial/proposals/demo/*`; `frontend/src/app/shared/**/proposal-workspace*`; `frontend/src/app/app.routes.ts`

Проверено: `proposal-workspace-demo.page.*`; `docs/pages/kp-workspace-geometry.md`; `app-layout` chrome rail pattern

## ИСХОДНОЕ СОСТОЯНИЕ

- Demo page = self-contained shell + `PiChromeToolsService` rail registration.
- Geometry laws in CSS; panel overlay 480px; no store/API.

## ЧТО ДЕЛАТЬ

1. Создать **`ProposalWorkspaceShellComponent`** (standalone): вынести разметку/стили из demo в `frontend/src/app/pages/commercial/proposals/workspace/` (или `shared/page/` если переиспользуемо).
2. Inputs/outputs: `orientation`, `panelCollapsed`, `activeSection`, `panelTitle`, `@Output` sectionChange, panelToggle, sheetClick, orientationChange.
3. **Content projection:** `<ng-content select="[kpWsRibbonExtra]">` для ribbon; `<ng-content select="[kpWsPanel]">` для panel body; center slot для A4 host.
4. Demo page **`ProposalWorkspaceDemoPage`** → thin wrapper: dummy placeholders only.
5. Новый route **`/proposals/workspace?id=`** (adminOnly): shell + «подключение позже» placeholder panel (не трогать `/proposals/create`).
6. CSS: single source — component styles; sync `tasks/kp-workspace-dummy/kp-workspace-shell.css` comment «generated from shell» or import shared tokens only.
7. Jest: shell renders, panel overlay class, collapsed transform, orientation classes — **≥6 tests**.
8. Прогнать geometry checklist из `kp-workspace-geometry.md` на demo + workspace routes.

## ИЗМЕНЯТЬ

- New: `proposal-workspace-shell.component.{ts,html,css,spec.ts}`
- `proposal-workspace-demo.page.*` (slim)
- `app.routes.ts` (workspace route)
- `tasks/kp-workspace-dummy/README.md`

## НЕ ИЗМЕНЯТЬ

- `proposal-create.page.ts`
- Geometry tokens values (`--kp-panel-w: 480px`)
- Business logic / API

## КРИТЕРИИ ПРИЁМКИ

- [ ] `/proposals/demo-workspace` визуально идентичен pre-TZ (PO geometry PASS)
- [ ] `/proposals/workspace` открывается, shell + empty panel
- [ ] Shell unit tests ≥6 PASS
- [ ] No rule shrinking A4 on panel open (landscape)
- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] `pnpm test -- proposal-workspace` PASS
- [ ] `pnpm lint` PASS (touched files)

## Proof of adoption

1. Routed: `/proposals/workspace` + demo wrapper
2. Tests: shell spec
3. Docs: `kp-workspace-geometry.md` § Files updated
4. Migration: demo CSS not duplicated long-term
5. Legacy: create page unchanged

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-401.done.md`
