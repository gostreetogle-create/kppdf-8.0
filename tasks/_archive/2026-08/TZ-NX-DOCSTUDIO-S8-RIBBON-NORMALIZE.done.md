# TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE — DONE

**agent_id:** cursor-orchestrator  
**claimed_at:** 2026-08-30T19:35:00Z  
**completed_at:** 2026-08-30T22:35:00+03:00

## Outcome

Ribbon `/studio/:id` — все контролы **26px** (`--kp-ribbon-control-h`):

- «+ Страница» → `kp-ws-ribbon-btn` (убран `app-pi-button` 32px)
- Page-nav стрелки 26×26, icon 14px
- Badge / «Страниц: N» — flex align, height 26px
- `kp-ws-ribbon-btn--active` в shell CSS (gold)
- Разделитель перед блоком «К списку…»

## Gates (exit 0)

- `pnpm exec nx test kppdf-web --testPathPattern=studio` → 0
- `pnpm exec nx build kppdf-web` → 0

## Files

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.css`
- `docs/pages/document-studio.page.md`
