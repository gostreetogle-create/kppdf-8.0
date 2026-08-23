# UI Dialog Canon (кратко)

> Эталон для новых TZ. Полный cookbook: [`../DIALOG-COOKBOOK.md`](../DIALOG-COOKBOOK.md).  
> Аудит + outliers: [`../audits/2026-08-08-dialog-layout-canon.md`](../audits/2026-08-08-dialog-layout-canon.md).

## Kinds A–D

| Kind | Shell | Ширина | Сценарий |
|------|-------|--------|----------|
| **A confirm** | `alert` / `destructive` | sm–md | confirm / delete |
| **B quick** | `form` | S→md · M→lg · L→xl (~920) + 2-col M/L | QuickCreate |
| **C editor** | `content` | `maxWidth: min(1120px, 100vw-2rem)` | FullEditor product/material/module/role **+ composition picker** (DIALOG-305) |
| **D wide** | `content` / form+maxWidth | `min(1400px, …)` | table-template и явные исключения |

## Правила

1. Только `PiDialogService` + `<app-pi-dialog>`.
2. Dense form → **шире**, не выше без нужды; body scroll ≤ ~70vh; footer не уезжает.
3. Не плодить ad-hoc `width: 360px` / свои Overlay.
4. Не переписывать все FullEditor одним TZ — successors по outliers table в audit.
5. Ёмкость полей (Д/Ш/В не на полширины) — kind **B и C**: [`ui-form-field-capacity.md`](./ui-form-field-capacity.md).
6. Kind C на 1440: identity-блок без body-scroll после packing. Не раздувать maxWidth. Страница — крайний случай per-editor, не отмена kind C.

## Overlay platform contract (TZ-UI-WR-501)

Распространяется на `PiDialogService` / `PiDrawerService` / `PiSheetService` —
единый контракт после WR-501:

1. **Return-focus:** при закрытии фокус возвращается на trigger, который открыл
   overlay (сохраняется `document.activeElement` на open, восстанавливается на
   close). Закрытие без restore focus запрещено.
2. **Focus trap:** CDK `ConfigurableFocusTrapFactory` на `overlayElement` (панель) —
   Tab не выходит из модального overlay.
3. **Scroll lock:** все три используют `scrollStrategies.block()` (drawer переведён
   с `reposition()` в WR-501) — фон не скроллится, пока overlay открыт.
4. **Esc / backdrop:** закрытие по умолчанию, отключается флагами
   `dismissOnEscape` / `dismissOnBackdropClick` (исключение — формальные
   exceptions, см. KP-CATALOG-REVIEW-NO-ESC в WR-510).
5. **Z-index:** только токены `--z-*` из `docs/paper-and-ink.md` (диалог 80,
   sheet 70, drawer 60). Magic numbers на shared overlays запрещены.

**Migration note (WR-501):** новый overlay вручную (свой backdrop, `@HostListener`
без restore, `z-40`/`z-index:100`) — запрещён: сначала `PiDialogService` /
`PiSheetService` / `PiDrawerService`, иначе review reject.
