# TZ-NX-DOCSTUDIO-S7-PASSPORT-BG — фоновый рисунок / тайлинг (паспорт изделия)

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-RIBBON-EXPORT DONE  
**IMPLICIT CONFLICT:** `nx build kppdf-web` + backend render при необходимости  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-blocks-canvas.component.ts`; image block settings

**Контекст PO:** паспорт изделия — фоновый рисунок под прозрачными слоями.

## ЧТО ДЕЛАТЬ

1. Image layer «на весь лист» + `settings.overlay` / letterhead index по `document-studio` wave 17.
2. Canvas: фон под блоками, прозрачные текст/таблица не закрывают.
3. Preview/PDF: тот же stacking (z-index doc-bg).

## КРИТЕРИИ

- [ ] Фоновое изображение видно сквозь текст/прозрачную таблицу
- [ ] Full-page image не ломает drag других слоёв
- [ ] build green
