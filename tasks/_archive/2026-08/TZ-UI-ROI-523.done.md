# TZ-UI-ROI-523 DONE — Dirty-close на desk flyout (форма заказа)

```
ARCHIVE_MARKER
task_id: TZ-UI-ROI-523
outcome: DONE
closed_at: 2026-08-23T11:05:00+03:00
agent_id: freebuff-roi-523 (Buffy, Freebuff ROI-523)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

- **ШАГ 1 — путь:** flyout = hardened local shell (WR-509 path B), не PiSheet — подтверждено по
  `TZ-UI-WR-509.done.md`. Confirm discard — тот же `PiDialogService` + `AlertDialogComponent`, что delete.
- **ШАГ 2 — expose dirty:** публичный геттер `isDirty` на `OrderFormPanelComponent`
  (`form.dirty || quickForm.dirty`). Проверено в исходнике Angular Forms: `FormArray.push` и
  `patchValue` НЕ маркируют форму dirty → чистый create/edit открывается pristine (нет ложных confirm).
- **ШАГ 3 — guard `closePanel()`:** dirty → AlertDialog RU
  `title: 'Закрыть без сохранения?'` / `description: 'Есть несохранённые данные.'` /
  `confirmLabel: 'Закрыть'` / `cancelLabel: 'Остаться'` (width sm, parentDestroyRef). Confirm →
  `performClose()`; cancel → панель остаётся (return-focus диалога возвращает фокус в форму, WR-501).
- **ШАГ 4 — все пути (Esc / backdrop / X / cancelled):** все идут только через guarded `closePanel()`.
  **Ключевой фикс:** CDK слушает Esc на `body` без stopPropagation → при открытом confirm-диалоге
  document-listener страницы сработал бы повторно и заново открыл бы диалог (петля Esc).
  Esc-хендлер переведён с `@HostListener('document:keydown.escape')` на компонентный
  `@HostListener('keydown.escape')`: когда фокус в CDK-overlay диалога, событие до host не доходит —
  детерминированно, без флагов/состояния. Регрессий нет: при открытом flyout фокус всегда внутри
  host (WR-509 trap), Esc-без-flyout — no-op как раньше.
- **ШАГ 5 — Specs (3 новых):**
  - `manager-desk.page.spec.ts` +2: dirty+Esc → dialog (title/кнопки) + панель открыта; «Остаться» →
    панель остаётся; повторный Esc → снова dialog; confirm → панель закрыта + return-focus на trigger
    (после 509); clean+Esc → close БЕЗ dialog.
  - `order-form-panel.component.spec.ts` +1: `isDirty` false на открытии (с 1 пустой позицией),
    false после программного `setValue`, true после `markAsDirty` (CVA-путь).
- **ШАГ 6 — docs:** `manager-desk.page.md` строка 523 (guard + host-level Esc).

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (0)
- `pnpm exec jest --testPathPattern="manager-desk.page.spec|order-form-panel.component.spec"` PASS 44/44
  (было 41; +2 manager-desk, +1 order-form)
- `pnpm lint` PASS — 0 errors (18 pre-existing warnings); eslint на 4 своих файлах 0
- `git diff --check` PASS

## Proof of adoption

- consumer: `/desk` — `app-manager-desk-page` flyout create/edit/bom (`OrderFormPanelComponent`,
  routed production) + форма «Отмена» (cancelled → closePanel) + X/backdrop/Esc
- test: `manager-desk.page.spec.ts` (2 новых: dirty-discard-close, clean-close) +
  `order-form-panel.component.spec.ts` (1 новый: isDirty), суммарно 44/44
- docs: `docs/pages/manager-desk.page.md` (523 bullet: guard + host-level Esc)
- migration note: любой новый путь закрытия flyout с формой обязан идти через guarded `closePanel()`;
  Esc-хендлер страницы — на host (`keydown.escape`), не `document` (иначе confirm-диалог
  переоткрывается); новым confirm-диалогам — только `PiDialogService`+`AlertDialog`, не новый примитив
- legacy leftover: builder/KP dirty-close → отдельный TZ (не здесь); `onOrderSaved`/`reconcile`/
  `toggleOrder` закрывают панель без guard (успешный save / роут-закрытие — вне скоупа TZ);
  `PiSheetService` миграция — successor WR-509
