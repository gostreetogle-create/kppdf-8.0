# TZ-NX-LUCIDE-ICONS-REGISTER: NX `LucideAngularModule.pick` (crash `check`)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** global (любой экран с `app-pi-checkbox` / badge / card arrow)  
**PAGE_DOCS:** —

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/app.config.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/checkbox/checkbox.component.ts` (comment only if needed) ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`; `frontend-nx/apps/kppdf-web/src/app/app.config.ts` (нет Lucide pick); `frontend-nx/libs/ui/paper-and-ink/src/lib/checkbox/checkbox.component.ts` (`<i-lucide name="check|minus">`); `tasks/_archive/2026-08/TZ-CRASH-401.done.md` (фикс был только в legacy `frontend/`); `docs/TZ-NX-BUILD-INTEGRITY.md` §5
- **Key Constraints:** Mode A handoff. Не трогать legacy `frontend/`. Только string-lookup иконки, которые реально есть в NX (`check`, `minus`, `arrow-up-right`).
- **Planned Deliverable:** `importProvidersFrom(LucideAngularModule.pick({ Check, Minus, ArrowUpRight }))` в NX `app.config.ts`
- **Validation Path:** FIC G (gates) + ручная проверка: отметить `app-pi-checkbox` → нет console ERROR Lucide

**Проверено:** string-lookup в NX: checkbox (`check`/`minus`), card / pi-showcase-card (`arrow-up-right`), badge (`[name]="icon()"`). `[img]=` bindings не требуют pick.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Console: `ERROR Error: The "check" icon has not been provided by any available icon providers.` (lucide-angular).
2. `app-pi-checkbox` рендерит `<i-lucide name="check">` — нужен `LUCIDE_ICONS` из `.pick()`.
3. Legacy fixed в **TZ-CRASH-401** (`frontend/src/app/app.config.ts`). NX `app.config.ts` — **пустой** по Lucide (cutover gap).
4. `TZ-NX-REGISTRIES-PLATFORM` уже флагнул gap и обошёл через `[arrow]="false"`.

## ЧТО ДЕЛАТЬ

1. В `frontend-nx/apps/kppdf-web/src/app/app.config.ts` добавить:
   - `importProvidersFrom(LucideAngularModule.pick({ Check, Minus, ArrowUpRight }))`
   - импорты из `lucide-angular` + `importProvidersFrom` из `@angular/core`.
2. Спека/регресс: unit на app.config providers **или** checkbox harness, который монтирует checked=true и не бросает Lucide provider error (как в CRASH-401 духе).
3. Docs: одна строка в Executor report + `_NOW` Claude status. Page.md не обязателен (global).

## НЕ ИЗМЕНЯТЬ

- legacy `frontend/**`
- набор иконок сверх трёх имён string-lookup
- BE / uploads / sync-quotation (отдельный TZ)

## КРИТЕРИИ ПРИЁМКИ

1. После hard refresh: клик по любому `app-pi-checkbox` → **нет** Lucide «has not been provided» в console.
2. Grep: `LucideAngularModule.pick` присутствует в NX `app.config.ts`.
3. Gates ниже PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test
  cd frontend-nx && pnpm lint
  pnpm architecture:check
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**

## Финализация

Archive → `tasks/_archive/2026-09/` + checklist + commit/push по `GEMINI.md` / `docs/GIT-POLICY.md`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS in touched files (pre-existing 38-error baseline debt outside scope; verified via git stash unaffected)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-LUCIDE-ICONS-REGISTER.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
