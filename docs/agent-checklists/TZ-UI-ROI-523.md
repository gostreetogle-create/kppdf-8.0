# TZ-UI-ROI-523 — Dirty-close на desk flyout (форма заказа)

## Claim

```
CLAIMED
task_id: TZ-UI-ROI-523
agent_id: freebuff-roi-523 (Buffy, Freebuff ROI-523)
claimed_at: 2026-08-23T10:38:56+0300
workspace: D:\kppdf-8.0
branch: main
```

## Conflict keys

- `frontend/src/app/pages/desk/manager-desk.page.ts`
- `frontend/src/app/pages/desk/manager-desk.page.spec.ts`
- `frontend/src/app/shared/orders/order-form-panel.component.ts`
- `frontend/src/app/shared/orders/order-form-panel.component.spec.ts`

## Plan

1. ШАГ 1: WR-509 DONE в архиве — flyout = hardened local shell (path B), не PiSheet.
   Confirm discard — тот же `PiDialogService` + `AlertDialogComponent`, что delete.
2. ШАГ 2: геттер `isDirty` на `OrderFormPanelComponent` (`form.dirty || quickForm.dirty`).
3. ШАГ 3: guard `closePanel()`: dirty → AlertDialog RU («Закрыть без сохранения?» /
   «Есть несохранённые данные.» / «Закрыть» / «Остаться»); confirm → close; cancel → панель остаётся.
4. ШАГ 4: Esc-хендлер переводится с `document:keydown.escape` на компонентный `keydown.escape`
   — при открытом confirm-диалоге фокус в CDK-overlay, событие до host не доходит, guard не
   переоткрывает диалог (CDK слушает body без stopPropagation).
5. ШАГ 5: specs — dirty+Esc → dialog + panel open; confirm → closed + return-focus (после 509);
   cancel → panel остаётся; clean+Esc → close без dialog.
6. ШАГ 6: строка в `manager-desk.page.md`; Proof of adoption в `.done.md`
   (consumer=/desk, tests, docs, migration note, leftover=builder/KP dirty → отдельный TZ).

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- `cd frontend && pnpm exec jest --testPathPattern="manager-desk.page.spec|order-form-panel"`
- `cd frontend && pnpm lint` (свои файлы — eslint)
