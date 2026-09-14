# TZ-NX-SHELL-RAIL-MENU-CLOSE: меню «Документ» закрывается при другом rail

**РОЛЬ АГЕНТА:** Executor (frontend-nx app-shell) — freebuff или claude  
**ЗАВИСИМОСТИ:** `TZ-NX-PO-SWEEP-07` (category menu) DONE  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** site-wide chrome (repro `/studio/:id`)  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` (короткая строка) опционально

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight
- **Context read:** `app-shell.component.ts` `onShellToolClick` L519–535; `onDocumentClickOutside` L548–555 (игнор `.shell-rail-item`)
- **Root cause:** outside-click **намеренно** не закрывает меню при клике по другому rail item; ветка без `items` зовёт `invoke` **без** `closeMenu()`.

### ЧТО ДЕЛАТЬ

1. В `onShellToolClick` для tool **без** `items`: сначала `closeMenu()`, потом `invoke`.
2. Для tool **с** `items`: при открытии другого id (уже `set(tool.id)`) — ок; при повторном том же — toggle close (уже есть).
3. Spec: open Document menu → click Elements (or any non-menu right tool) → menu DOM gone + section onClick fired.
4. Не ломать: клик внутри `.shell-rail-menu`; Esc; body click; повторный клик Document = close.

### НЕ

- studio-editor.page / workspace-shell panels
- Убирать popover «Документ»
- REVISION / TEXT-PROPS / table TZ

### AC

1. Меню Документ открыто → клик Элементы/Слои/… → меню закрыто, панель секции открыта.
2. Меню → клик пустое → закрыто (как сейчас).
3. Gates: `app-shell.component.spec` + `nx build kppdf-web`.

### Claim
```
agent_id: claude
claimed_at: 2026-09-14T08:28:01Z
branch: main
baseline_sha: 7717c26e
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 3, including live smoke — see checklist Gates section)
  - typecheck: PASS (nx build)
  - tests: PASS
  - lint: PASS (0 new errors/warnings, verified via git-stash -u A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-SHELL-RAIL-MENU-CLOSE.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
