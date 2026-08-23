# TZ-KP-WS-410 — Hotfix: пустой viewport workspace

**Статус:** IN FIX — page.ts в main (DEN-552); **осталось:** draft.service + spec + deals chip.

## Scope дополнение

- `deals-group-chips.ts` — chip «Коммерческое предложение» → `/proposals/workspace` (навигация cutover)

## Симптом

`/proposals/workspace` — серая пустота, только chrome-rails и «Workspace · черновик»; нет ленты, A4, панели.

## Root cause

1. `proposal-workspace.page.ts` **не копировал** `:host` / `group-body--flush` flex CSS из demo → shell схлопывался по высоте.
2. `@if (selectedTemplate)` — без шаблона в sheet нет контента (dummy всегда рисовал A4-placeholder).

## Fix

- Flex chain как в `proposal-workspace-demo.page.css`
- Empty state `kp-ws-empty-state` + CTA «Выбрать шаблон»
- Первый визит без шаблона → `openSection('template')`
- `resumeLastDraft()` без draft → `resumeLastTemplate()` (не стирать lastTemplateId)

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- proposal-workspace && pnpm lint
```

## Conflict keys

`proposal-workspace.page.ts`, `proposal-workspace-draft.service.ts`
