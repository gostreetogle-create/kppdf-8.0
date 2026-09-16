# TZ-NX-DOCSTUDIO-DRAG-COORD-ROOT: починить прыжки drag/resize

> **SIZE:** S · **PAGES:** studio · **PAGE_DOCS:** `docs/pages/document-studio.page.md`  
> **РОЛЬ:** Executor Claude/Freebuff · **LAYER:** 3  
> **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/doc-studio/ui/studio-blocks-canvas.component.ts`; `studio-blocks-canvas.component.spec.ts`; `docs/audits/2026-09-15-docstudio-drag-jump-after-split.md`

### Preflight
- **Audit:** `docs/audits/2026-09-15-docstudio-drag-jump-after-split.md`
- **Symptom:** drag/resize блоков в Студии прыгает «не туда» после presenter split
- **Root cause:** `parentElement` блока = presenter host, не canvas sheet
- Skill: systematic-debugging → tdd regress

## ЧТО ДЕЛАТЬ

### 1. Coordinate root = canvas host
В `startDrag` и `startResize`:
- Inject `ElementRef` на canvas component (host = `pi-studio-blocks-canvas`).
- `const sheet = this.host.nativeElement` (или equivalent).
- `const rect = sheet.getBoundingClientRect()`.
- **Не** использовать `dragTarget.parentElement` / `closest('.studio-block')?.parentElement` как sheet.

Опционально hardening: `event.currentTarget` после re-emit может быть хрупким — брать ` (event.target as HTMLElement).closest('.studio-block')` для capture target, sheet всё равно host.

### 2. Regression test
- Spec: при drag вычисляемый layout использует ширину/высоту **host**, не вложенного wrapper (подставить spy getBoundingClientRect на host vs fake parent — или интеграционный: pointer move → layout x/y двигается в сторону курсора с разумным знаком).
- Минимум: unit на helper если вынесете `studioPointerDeltaFraction(sheetRect, start, current)`.

### 3. Live sanity (если API)
Открыть `/studio/:id`, drag текст вправо → блок едет вправо; resize SE → растёт к углу. Без прыжка в угол листа.

## НЕ
- Новый UI-SPLIT / обратно вlining presenters «заодно»
- Менять snap/clamp формулы кроме root rect
- Deploy / wipe
- Home/order chrome TZ (другая волна)

## AC
1. Drag в сторону курсора 1:1 по листу (нет прыжка в противоположную/случайную сторону).
2. Resize тоже от host rect.
3. Spec regress PASS; `nx test features --testPathPattern=studio-blocks-canvas`; `nx build kppdf-web` LAST.
4. Archive + commit.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern=studio-blocks-canvas --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
