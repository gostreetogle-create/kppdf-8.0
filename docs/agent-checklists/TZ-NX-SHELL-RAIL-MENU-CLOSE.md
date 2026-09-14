# TZ-NX-SHELL-RAIL-MENU-CLOSE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHELL-RAIL-MENU-CLOSE.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as part of a "Freebuff" UI-pack wave prompt but actually
> run in a Claude Code session — same budget-labeling routing note as the rest of this
> wave (`docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`). `agent_id: claude`
> below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T08:28:01Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] `tasks/_active/` empty before claim — no conflicting agent on `app-shell.component.ts`
- [x] TZ read (`tasks/_ready/TZ-NX-SHELL-RAIL-MENU-CLOSE.md`) — its own Preflight already named the exact root cause (`onShellToolClick` L519–535, `onDocumentClickOutside` L548–555)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHELL-RAIL-MENU-CLOSE.md` на месте

## Acceptance

- [x] Меню Документ открыто → клик Элементы/Слои/… → меню закрыто, панель секции открыта (live-verified)
- [x] Меню → клик пустое → закрыто как раньше, no regression (unit + live verified)
- [x] Gates: `app-shell.component.spec` + `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (site-wide chrome bugfix, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` — one sentence appended to the existing PO-sweep-07 «Документ» menu paragraph (repro page per the TZ header; the component itself is site-wide chrome, not studio-specific)
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите — `docs/PO-CANON.md`/`docs/PO-SHARED-UNDERSTANDING.md`/`docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent left untouched, not staged
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start, confirmed at TZ 5b close)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 129 suites / 985 tests (978 passed, 7 skipped) — 3 new tests added
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 314 warnings; **git-stash -u A/B verified** baseline (without this TZ's diff) = 38 errors / 314 warnings — 0 new errors, 0 new warnings
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- `pnpm architecture:check` (root) → passed (1488 files; baseline 17; resolved since baseline: 2)
- **Regression-sanity-check**: temporarily reverted the one-line `this.closeMenu()` fix — the new "clicking a plain rail tool while the menu is open closes it AND invokes the tool" test failed as expected (menu stayed open); restored, test passed again.
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-shell-rail-menu-close-smoke.mjs` — opened a fresh studio document, clicked the «Документ» rail category (menu visibly opens: Редактор/Просмотр/Сохранить/Скачать PDF/В архив — see screenshot), then clicked «Элементы». 5/5 checks PASS: the menu popover is gone from the DOM AND the Элементы panel (`pi-studio-elements-panel`, showing «+ Текст»/«+ Фото»/«+ Таблица») actually opened — proving the click on the other rail tool was not swallowed, only the previously-open menu was cleaned up. Evidence: `reports/TZ-NX-SHELL-RAIL-MENU-CLOSE-smoke.json`, `-1-menu-open.png`, `-2-menu-closed-elements-open.png`.

## Executor report

- **Fix** (`app-shell.component.ts` `onShellToolClick`): a rail tool without its own `items` submenu is still rendered inside a `.shell-rail-item` wrapper (same as a category tool), so `onDocumentClickOutside`'s outside-click guard (`target?.closest('.shell-rail-item')` → return, don't close) let a click on ANY plain tool through without ever closing an already-open category menu — the click's own handler ran `this.shellTools.invoke(tool)` directly with no `closeMenu()` call. One-line fix: call `this.closeMenu()` immediately before `this.shellTools.invoke(tool)` in that branch. The two other branches (opening/toggling a category's own menu) were already correct and untouched.
- **Tests**: new `describe` block in `app-shell.component.spec.ts` (3 tests) using the real `ShellToolRailService` (injected via `TestBed.inject`, not mocked) with a synthetic `{ id: 'document', items: [...] }` + `{ id: 'elements', onClick }` pair mirroring the real studio page's own tool definitions (`studio-editor.page.ts`'s `STUDIO_TOOL_OWNER` block): (1) the actual bug — clicking «Элементы» while «Документ» is open closes the menu and still invokes `elementsClick`; (2) no regression — clicking the same category button again still toggles the menu closed; (3) no regression to `TZ-NX-PO-SWEEP-07` — an outside/empty click still closes the menu.
- **Docs**: `docs/pages/document-studio.page.md` — one bolded sentence appended to the existing PO-sweep-07 «Документ» menu paragraph, naming the TZ and the root cause in one line.
- Known limits: none beyond the TZ's own stated non-goals (did not touch `studio-editor.page` / workspace-shell panels, did not remove the «Документ» popover, did not touch REVISION/TEXT-PROPS/table TZs — all out of scope as written).

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
