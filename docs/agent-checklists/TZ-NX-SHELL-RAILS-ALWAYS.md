# TZ-NX-SHELL-RAILS-ALWAYS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHELL-RAILS-ALWAYS.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (1.1)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T17:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date, `_active` empty before claim
- [x] TZ read in full (`tasks/_ready/TZ-NX-SHELL-RAILS-ALWAYS.md`);
  `docs/PO-CANON.md` page-tools line read and confirmed already corrected by
  Cursor (matches this TZ's canon exactly); `docs/pages/page-chrome.md` §NX
  shell rails (stale IDLE-RAILS table) read; `app-shell.component.ts`,
  `app-shell.component.spec.ts`, `shell-tool-rail.service.ts` read in full
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, `PO-CANON.md` page-tools line (verified already
  fixed), `page-chrome.md` §NX shell rails, `app-shell.component.ts` (full),
  `app-shell.component.spec.ts` (full, 26 existing tests), `shell-tool-rail.service.ts`
  (full); repo-wide grep for `shell-nav-back/forward`/`shell-rail-left/right`
  usage outside these 2 files (only a synthetic unrelated DOM node in
  `studio-editor-outside-click.spec.ts`, unaffected)
- **Key Constraints:** don't restore `tool-rail-definitions` disabled demo
  tools; exactly one ←→ pair site-wide (now in rails, not header); grid
  always 3 columns; don't touch wipe/deploy/wave 2
- **Planned Deliverable:** always-render both `<aside>`s, history buttons
  moved into each rail's top (with a spacer before live tools), header ←→
  removed, `gridTemplateColumns` simplified to a fixed 3-col constant,
  specs rewritten, `page-chrome.md` §NX table replaced
- **Validation Path:** FE tsc + FE jest (scoped then full) + eslint (scoped)
  + architecture:check + `nx build kppdf-web` last + live Playwright on an
  idle route and a `setTools` route

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-SHELL-RAILS-ALWAYS.txt`

## Acceptance (из TZ)

- [x] 1. `/counterparties` (list без setTools): видны L и R панели одинаковой
  ширины; ← слева, → справа; нет полупрозрачных page-tools — live-подтверждено
  (grid `64px 1142px 64px`, 0 page-tools на обеих сторонах, нет «скоро»)
- [x] 2. `/production`: те же панели + page-tools под history — live-подтверждено
  (3 left tools, 1 right tool, рендерятся под ←/→, не «в пустоте»)
- [x] 3. Header **без** пары ←→ — live-подтверждено (0 совпадений в header на
  обеих страницах) + unit-test
- [x] 4. Specs зелёные; `page-chrome.md` + gates / nx build — все PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: overreach rollback (revert к правильному canon-поведению
  предыдущей TZ), не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: `docs/pages/page-chrome.md` §"NX shell rails" — таблица
  переписана + добавлен абзац «История правки», объясняющий 2026-09-10
  overreach и 2026-09-13 коррекцию
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] Чужой WIP не в коммите; conflict keys соблюдены: `app-shell.component.ts`
  (+ `.spec.ts`), `shell-tool-rail.service.ts`, `page-chrome.md` — ровно
  список из TZ. `PO-CANON.md` НЕ тронут (уже верен, только сверен)
- [x] Канон: не восстанавливал `tool-rail-definitions`/disabled «скоро»
  demo-tools; не трогал wipe/deploy; волну 2 из WAVE-SUCCESSORS не стартовал

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache --testFile=app-shell.component.spec.ts` → 26/26 PASS
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache` (full) → 125 suites / 892 passed + 7 skipped (899 total) PASS, same totals as before
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/layout/app-shell.component.ts apps/kppdf-web/src/app/layout/app-shell.component.spec.ts apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts` → 0 errors, 19 pre-existing warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live Playwright (local dev, admin/admin123): `/counterparties` (idle) and
  `/production` (setTools) both PASS — rails always present, equal width,
  history in rails, header clean, page-tools intact, no "скоро" text, 0 page errors

## Executor report

**Overreach confirmed exactly as the TZ described:** the prior
`TZ-NX-SHELL-01-IDLE-RAILS` (2026-09-10) was asked to remove disabled "скоро"
demo placeholder icons, but its implementation also made the rail `<aside>`s
themselves conditional on having tools and relocated history to the header —
a much bigger visible change than requested, caught by PO screenshots of
Гант/Клиенты. Fix reverts exactly the overreach (rails always in DOM, history
back in the rails) while keeping the part of the prior TZ that was actually
correct (no disabled demo tools, live-only page-tools API unchanged).

**`PO-CANON.md` cross-check:** the TZ flagged this file's page-tools line as
"already updated by Cursor, verify" — confirmed via `git diff` that Cursor's
uncommitted local edit already states the corrected canon word-for-word
consistent with this TZ. Left untouched (not this TZ's file to commit; it's
Cursor's own concurrent WIP in the shared working tree).

**Simplification found along the way:** `gridTemplateColumns` no longer needs
to be a `computed()` with 4 branches (0/1/2-sided) since it's now always the
same 3-column string — replaced with a plain readonly constant, removing
dead branching rather than leaving it as an always-true `computed()`.

**Not done (per TZ "НЕ"):** `tool-rail-definitions.ts` stays deleted, no
demo/disabled tools reintroduced anywhere; no mobile-breakpoint toolbar
fallback added (none existed before — recorded as a fact in evidence per the
TZ's own `known_limitation`, not implemented).

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T18:00:00Z
