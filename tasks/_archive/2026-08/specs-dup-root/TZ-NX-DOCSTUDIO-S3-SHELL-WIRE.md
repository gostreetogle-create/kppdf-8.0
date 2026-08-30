# TZ-NX-DOCSTUDIO-S3-SHELL-WIRE — подключить блоки без patch CRLF shell

РОЛЬ: executor (Freebuff #2), frontend-nx only  
СТАТУС: **ACTIVE** — продолжение S3, claim `TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS`  
ЗАВИСИМОСТИ: data-access + canvas/layers/properties уже на диске; S2 shell в `studio-shell.page.ts`

IMPLICIT CONFLICT: `nx build kppdf-web`

## Проблема

`studio-shell.page.ts` на диске в CRLF; patch/StrReplace у агента не применяется → S3 не wired.  
**Не патчить этот файл.** Обход одобрён PO/Cursor.

## Решение (единственное)

1. **Создать новый файл** `apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (LF, Read S2 shell как образец + wire blocks).
2. **Поменять одну строку** в `studio.routes.ts`:
   - `:id` → `loadComponent: () => import('./studio-editor.page').then(m => m.StudioEditorPage)`
3. `studio-shell.page.ts` **не удалять** (S2 reference / known_limitation «superseded by editor route»).
4. Wire: `PiStudioBlocksService`, `<pi-studio-blocks-canvas>`, layers/properties panels, debounce layouts, 409 toast, stopPropagation на блоке.
5. Сохранить S2 data-test: `studio-shell`, `studio-stage`, `studio-sheet`, panel 480px, geometry via `studioSheetRect`.

## Gates

```bash
grep PiStudioBlocksService apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts  # MUST match
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio
cd frontend-nx && pnpm exec nx build kppdf-web  # last, exit 0
```

## Acceptance

- grep PiStudioBlocksService в **studio-editor.page.ts** (не shell)
- `/studio/:id` route грузит editor
- evidence + archive S3 (родительская TZ) + push

НЕ трогать: `registries/**`, `backend/**`, `frontend/**`
