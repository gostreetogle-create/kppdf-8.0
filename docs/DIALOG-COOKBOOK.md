# Dialog cookbook (Paper & Ink)

> Обязательно для любого агента, который открывает модалки.  
> Нарушение = откат (как People / WORKERS-302 PiDialog API footgun).  
> Короткая шпаргалка kinds: [`pages/ui-dialog-canon.md`](./pages/ui-dialog-canon.md) · аудит 2026-08-08: [`audits/2026-08-08-dialog-layout-canon.md`](./audits/2026-08-08-dialog-layout-canon.md).

## Открытие

```ts
import { PiDialogService } from '.../shared/ui/dialog/pi-dialog.service';
import { inject, DestroyRef } from '@angular/core';

const dialogs = inject(PiDialogService);
const destroyRef = inject(DestroyRef);

const ref = dialogs.open<Result, Data>(MyDialogComponent, {
  data: { ... },
  parentDestroyRef: destroyRef, // обязательно для route/tab destroy
  // maxWidth: 'min(1120px, calc(100vw - 2rem))' — для широких form на mobile
});
```

Внутри компонента диалога:

- Shell: `<app-pi-dialog variant="form|content|..." [width]="'sm'|'md'|'lg'|'xl'" [animate]="false">`
- Контент в `[body]`, кнопки в `[footer]`
- Закрытие: `inject(PI_DIALOG_REF).close(value)` — **не** самодельный Overlay

## Запрещено

- Новый `Overlay.create` / самодельный backdrop вне `PiDialogService`
- Игнорировать `parentDestroyRef`
- Фиксированный `width: 360px` без viewport clamp на mobile-критичных диалогах
- Менять payload shape «заодно» в polish-TZ

## Kinds A–D (мало разрешённых)

| Kind | variant | width / maxWidth | Когда |
|------|---------|------------------|--------|
| **A confirm** | alert / destructive | sm–md | Удалить? Да/нет |
| **B quick** | form | S→**md**, M→**lg**, L→**xl** (~920) + **12-col field capacity** M/L | QuickCreate S/M/L |
| **C editor** | content | maxWidth `min(1120px, 100vw-2rem)` | Full product/module/material/role |
| **D wide** | content / form+maxWidth | `min(1400px, …)` только table-template и явные исключения | Редко |

**Правило плотности:** для dense forms **prefer width over height** — лучше добавить колонку/ширину, чем небоскрёб без скролла body. Body: `max-h ~70vh` + `overflow-auto`; footer sticky / `shrink-0` (shell).

**Ёмкость полей (внутри kind B):** наивная сетка «всем 50%» запрещена для коротких чисел (Д/Ш/В/вес). Канон span/упаковки: [`pages/ui-form-field-capacity.md`](./pages/ui-form-field-capacity.md) · аудит [`audits/2026-08-08-form-field-capacity-canon.md`](./audits/2026-08-08-form-field-capacity-canon.md) · TZ-UX-FORM-301.

Opener `dialog.open(..., { width })` не должен **перебивать** ширину, которую уже решает компонент (например QuickCreate `SIZE_TO_WIDTH`).

## Mobile (375px)

- Широкие формы: `maxWidth: 'min(<px>, calc(100vw - 2rem))'` в `DialogConfig` **или** CSS на shell `max-width: min(..., 100vw - 2rem)`
- Panel opaque (фон `bg-paper`); **не** полагаться на `backdrop-filter` оверлея (его нет)
- Sticky page headers с `backdrop-blur` под открытым диалогом могут «морозить» страницу — убедись, что dimmer/overlay закрывает viewport
- Footer sticky / `shrink-0` — паттерн `PiDialogComponent` footer; не уезжает при длинном body
- Smoke: DevTools 375×667 — панель целиком, footer виден, Scrim кликабелен

## Width tiers (`[width]`)

| Tier | Типичный max | Когда |
|------|--------------|--------|
| sm | ~360px | setup chips, confirm |
| md | ~480–560 | простые формы / QuickCreate S |
| lg | ~640 | QuickCreate M / средние forms |
| xl | ~920 (form) | QuickCreate L / широкие forms — **clamp к viewport** |
| content + maxWidth | 1120 / 1400 | kinds C / D |

## Sticky footer

Header + footer не скроллятся; body `overflow-auto` / `min-h-0`. Не дублировать второй footer вне shell.

## Валидация полей

См. [`UX-FORM-CANON.md`](./UX-FORM-CANON.md): **не** всплывающий текст, который сдвигает соседние поля. Канон — красная рамка / `aria-invalid`.

## После изменений

- Unit: dialog host / opener specs если есть
- Browser: хотя бы один 375px сценарий в AC TZ
- Docs: строка в page `.md` если менялся контракт открытия
