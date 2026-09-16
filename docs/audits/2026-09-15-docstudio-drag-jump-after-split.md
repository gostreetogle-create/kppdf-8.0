# Audit — DocStudio block drag jumps after presenter split (2026-09-15)

## Symptom
PO: в Студии текст/таблица при drag «прыгают» не туда; выделить/переместить как раньше нельзя.

## Root cause (код)

`studio-blocks-canvas.component.ts` `startDrag` / `startResize`:

```ts
const dragTarget = event.currentTarget as HTMLElement;
const parent = dragTarget.parentElement;
const rect = parent.getBoundingClientRect();
const dx = (e.clientX - start.x) / rect.width;
```

**До UI-SPLIT:** `article.studio-block` был прямым ребёнком canvas (`:host { position:absolute; inset:0 }` = лист A4) → `parent` = лист → нормализация в % листа верная.

**После split** (`pi-studio-text/image/table-block-presenter`): DOM =

```
pi-studio-blocks-canvas          ← лист (inset:0)
  pi-studio-*-block-presenter    ← лишний host-wrapper (не inset:0)
    article.studio-block         ← pointerdown
```

`parentElement` блока = **presenter host**, не лист. Его `getBoundingClientRect()` ≠ размер A4 → dx/dy в «чужой» системе → прыжок / уезд.

`startResize` берёт `handle.closest('.studio-block')?.parentElement` — та же ошибка.

## Fix direction
Coordinate root = **canvas host** (`ElementRef` / `closest('pi-studio-blocks-canvas')` / `host.nativeElement`), не `block.parentElement`.  
Regression test: mock rects — parent wrapper ≠ host → layout delta follows host.

## Related
Не liveRows/S46. Не revision 409. Чистый geometry after decomp UI-SPLIT presenters.
