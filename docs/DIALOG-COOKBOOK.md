# Dialog cookbook (Paper & Ink)

> Обязательно для любого агента, который открывает модалки.  
> Нарушение = откат (как People / WORKERS-302 PiDialog API footgun).

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
| md | ~480–560 | простые формы |
| lg / xl | ~720–1000 | materials/product/table — **clamp к viewport** |

## Sticky footer

Header + footer не скроллятся; body `overflow-auto` / `min-h-0`. Не дублировать второй footer вне shell.

## Валидация полей

См. [`UX-FORM-CANON.md`](./UX-FORM-CANON.md): **не** всплывающий текст, который сдвигает соседние поля. Канон — красная рамка / `aria-invalid`.

## После изменений

- Unit: dialog host / opener specs если есть
- Browser: хотя бы один 375px сценарий в AC TZ
- Docs: строка в page `.md` если менялся контракт открытия
