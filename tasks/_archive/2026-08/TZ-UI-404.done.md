# TZ-UI-404 — Group Workspace: чёрная TOC-строка на всех разделах (по канону «Сделки»)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

summary:
- 4 группы (Клиенты/Каталог/Снабжение/Цех), 10 маршрутов (`/counterparties`, `/people`,
  `/products`, `/modules`, `/materials`, `/catalog/appearance`, `/supply`, `/shipping`,
  `/production`, `/work-types`) переведены с `[chips]` (золото) на `[toc]` (чёрный),
  golden row оставлена пустой — по образцу уже принятого `contracts.page.ts`/
  `proposal-create.page.ts`.
- `catalog-appearance.page.ts` подтверждён как sibling «Каталога» (уже комбинировал
  `...CATALOG_SECTION_CHIPS` + себя в одном ряду до этой TZ) и включён в TOC той же логикой.
- Сделки/Заказы/Договоры/Склад не тронуты — уже были каноничны.
- 4 chip-файла (`clients-group-chips.ts`, `catalog-group-chips.ts`,
  `logistics-group-chips.ts`, `production-group-chips.ts`) получили поясняющий комментарий
  (сняли устаревшее «no TOC row» в catalog-group-chips.ts); имена констант
  (`*_SECTION_CHIPS`) намеренно не переименованы — минимальный риск, TZ помечал rename
  опциональным.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`frontend tsc -p tsconfig.app.json --noEmit`, 0 errors)
  - tests: PASS (420/424 focused Jest; 4 failures in `production-read.facade.spec.ts`
    — confirmed pre-existing/unrelated, file not touched by this TZ, reproduces in isolation)
  - lint: PASS (0 errors; 18 pre-existing unrelated `no-implements-oninit-in-pages` warnings)
  - architecture:check: PASS (979 files; baseline 6; resolved since baseline: 0)
  - browser (primary): PASS — `node scripts/tz-ui-404-toc-parity-smoke.mjs`, headless Chrome
    CDP against live `pnpm start` (4200) + `pnpm run start:dev` backend (3000), admin login,
    all 10 routes: dark TOC row present, correct `bg-ink text-paper` + `aria-current="page"`
    on the active tocId, gold chips row empty (`.group-chip` count 0). Report:
    `reports/TZ-UI-404-toc-parity-smoke.json`; screenshot:
    `reports/TZ-UI-404-counterparties-toc.png`.
  - checklist: ADDED and DONE (`docs/agent-checklists/TZ-UI-404.md`)
  - progress.md: not touched by this TZ (another agent has independent uncommitted progress.md
    edits from a concurrent TZ — out of scope here); `_NOW.md` updated with this TZ's line
  - status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
  - deploy/wipe: NOT RUN

known_limitation:
- Dark-theme active TOC chip (`bg-ink text-paper`) has low visual contrast against the
  already-dark page background — identical to the pre-existing behavior on
  `contracts.page.ts`/`proposal-create.page.ts` (same class binding), not a new defect
  introduced by this TZ.
- `production-read.facade.spec.ts` has 4 pre-existing failing tests unrelated to this TZ
  (Gantt bars fetch/cache timing) — file not touched, out of scope, flagged for a separate
  TZ if PO wants it fixed.
