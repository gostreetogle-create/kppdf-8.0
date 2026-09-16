# Audit: DocStudio image / passport size ≠ PDF (2026-09-13)

## Symptom (PO)

Фото → «Сделать фоном» (passport / `settings.overlay`): на холсте картинка **на весь лист (растянута/заполняет)**, в скачанном PDF — **меньше / с полями** (letterbox). Редактор ≠ PDF.

## Root cause (evidence)

1. **Passport на холсте (FE)** — `studio-blocks-canvas.component.ts`:
   - `.studio-block--passport-bg img { object-fit: contain }` (раньше в `styles`)
   - `.studio-block--image img { object-fit: cover }` (позже)
   - Passport-блок имеет **оба** класса (`studio-block--image` + `studio-block--passport-bg`) → одинаковая специфичность → **побеждает `cover`**.

2. **Passport в PDF/Просмотр (BE)** — `document-render.service.ts`:
   - `.doc-bg--block img { object-fit: contain }` — letterbox, белый фон.
   - Спек: `document-render.studio-canvas.spec.ts` ожидает `contain`.

3. Итог: холст показывает **cover**, PDF — **contain** → PO видит «в PDF уменьшилось».

## Canon (WYSIWYG)

- Passport / letterhead: **`object-fit: contain`** (весь рисунок виден, без crop краёв бланка) — как уже в BE + S7 intent.
- Холст должен совпасть с PDF: починить FE (специфичность), **не** переводить PDF на `cover`.
- Обычное (не-фон) фото-блок: оба пути уже `cover` — ок; доп. риск: `.studio-block { padding: 4px }` чуть сжимает img на холсте vs PDF без padding → выровнять padding для image.

## Out of scope

- Page-level `document.backgroundImage` (панель Страницы) — на NX sheet сейчас не рисуется отдельно от passport-блока; не путать с «Сделать фоном».
- Table photo cells / PREVIEW-UPLOADS-INLINE.
