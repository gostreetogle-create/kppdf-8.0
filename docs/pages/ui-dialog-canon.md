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
5. Внутри kind B — ещё **ёмкость полей** (Д/Ш/В не на полширины): [`ui-form-field-capacity.md`](./ui-form-field-capacity.md).
