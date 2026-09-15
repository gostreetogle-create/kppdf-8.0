# TZ-NX-HOME-CHROME-TOP — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- Removed the duplicate `.eyebrow «Главная»` above the `h1` on `/home` — one
  title now, per TZ-UX-315 (section identity SoT = top nav, not a
  pathLabel-eyebrow copy of the title).
- Workflow strip (Главная · КП · Гант · Снабжение · Отгрузка) moved off a
  body-level `<nav data-test="home-workflow-chips">` into
  `PiGroupWorkspace`'s sticky `[chips]` row — `activeId="home"`,
  `dataTestPrefix="home-workflow-chip"` (preserves the existing
  `home-workflow-chip-*` data-test values), `toc` stays `[]` (no Deals-style
  TOC on home). Chip routes/`orderId` query behavior unchanged — same
  `PiOrdersService`-free, pure-nav chips as before, just relocated.
- `docs/pages/home.page.md`: rewrote the "Операторский сценарий" section
  (removed the stale "верхняя крошка = Главная, дублирует заголовок"
  description of the bug being fixed; reordered steps so chrome chips come
  before the title/queue; dropped a stale `Комбайн` chip mention that
  never matched the real 5-chip list) and added a `TZ-NX-HOME-CHROME-TOP`
  note under "NX implementation" pointing at the new chrome-based
  rendering.
- `docs/agent-checklists/WAVE-NX-HOME.md`: noted this as the second
  follow-up TZ after `TZ-NX-HOME-BREADCRUMB-EDIT-CTA`.

## Gates

- `nx test kppdf-web` (full suite — `--testPathPattern` doesn't filter in
  this project, known quirk): `home.page.spec.ts` 8/8 PASS (was 6, +2 new:
  eyebrow-removed assertion, chrome-chips-not-body-nav assertion). Same one
  pre-existing unrelated `app-shell.component.spec.ts` failure as every
  recent TZ this session (chip-count regression from concurrent
  `WAVE-NX-HOME` commit `33e06c08` — not this TZ's scope, not touched).
- `nx build kppdf-web` (forced, `--skip-nx-cache`): PASS, ran last.
- Direct `eslint` on both touched files: same 2 pre-existing baseline
  errors as every file importing `features` (unrelated
  `@nx/enforce-module-boundaries` trigger from a registries file, documented
  in `docs/audits/2026-09-15-order-workspace-verify.md`) — zero new issues.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, unrelated, zero new issues)
  - checklist: N/A (S-size TZ, no dedicated checklist file requested)
  - progress.md: N/A
  - status synchronization: PASS
