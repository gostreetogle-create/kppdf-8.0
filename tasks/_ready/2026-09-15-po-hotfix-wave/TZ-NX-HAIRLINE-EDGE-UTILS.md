# TZ-NX-HAIRLINE-EDGE-UTILS: hairline-top / hairline-bottom реальные

> **SIZE:** S · **PACK:** WAVE-PO-HOTFIX-2026-09-15 follow-up  
> **PAGES:** global (lists/home/order-ws)  
> **PAGE_DOCS:** `docs/paper-and-ink.md` (hairline)  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`; consumers только если класс переименовываешь (предпочтительно **добавить** утилиты)  
> **ROLE:** freebuff

## BUILD INTEGRITY

`nx build kppdf-web` baseline + LAST.

## Domain preflight

Claude (COMPOSITION-DENSITY closeout): `hairline-bottom` / `hairline-top` используются ~15 файлов NX, но **не определены** как utilities → no-op в Tailwind.  
Necessity: оператор видит «рамки»/разделители где класс мёртвый — да.  
N/A: schema.

## ЧТО ДЕЛАТЬ

1. В `global.css` рядом с `.hairline` / `@utility hairline` добавить:
   - `hairline-top` → `border-top: 1px solid var(--color-rule)` (или канон проекта)
   - `hairline-bottom` → `border-bottom: …`
   - при необходимости `hairline-x` / left/right только если уже встречаются в grep
2. Не менять семантику существующего `hairline` (полный контур).
3. Smoke: один spec или visual note в done.md — класс резолвится (computed border).
4. Grep count в done.md.

## НЕ
- Редизайн таблиц  
- Dark Theme Pro  
- Deploy

## AC
1. Утилиты существуют; consumers получают реальный border.  
2. Light+dark rule цвет через `--color-rule`.  
3. `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx build kppdf-web
```
