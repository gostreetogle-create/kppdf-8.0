═══════════════════════════════════════════════════════════════
TZ-UI-ROI-522: ui-rules.md — слепок kit для агентов
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Docs / kit scribe
ЗАВИСИМОСТИ: TZ-UI-WR-506 DONE (есть `/kit/*`)
LAYER: 1–2
CONFLICT KEYS: docs/ui-rules.md; tasks/PROMPT-FREEBUFF-UI-WR-A.md;
  tasks/PROMPT-FREEBUFF-UI-WR-B.md; tasks/PROMPT-FREEBUFF-UI-WR-C.md;
  docs/AI-AGENT-GUIDE.md; frontend/src/app/pages/kit/**

PAGES: /kit/overview ; /kit/overlays ; /kit/forms ; /kit/foundations
PAGE_DOCS: N/A (kit)

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО
═══════════════════════════════════════════════════════════════

ШАГ 1 — Создан `docs/ui-rules.md` (48 строк, ≤120):
  - Таблица примитивов: Dialog, Sheet, Drawer, DropdownMenu, PiOverflowSelect,
    native `<select>`, PiSelect, PiButton, ErrorBanner, Skeleton, Toast,
    FormField, PiTable — import/service, когда, anti-use.
  - Блок ЗАПРЕЩЕНО: overlay через absolute/fixed в feature; UI вне shared/ui
    без TZ архитектора; Material; массовая миграция select без PO.
  - Stop rule: нет в таблице → STOP, TZ у архитектора, не кодить самому.

ШАГ 2 — Источник правды = живые `/kit/*` passports; ui-rules.md ссылается на
  них и на этот TZ как SoT для расхождений.

ШАГ 3 — Строка «Перед UI: прочитай `docs/ui-rules.md`» вшита:
  - `docs/AI-AGENT-GUIDE.md` (секция UI war-room, перед списком запретов).
  - `tasks/PROMPT-FREEBUFF-UI-WR-A.md` — файл перемещён в
    `tasks/_archive/2026-08/prompts-spent/PROMPT-FREEBUFF-UI-WR-A.md`
    (Wave A уже отработана до этого TZ); строка присутствует в архивной копии.
  - `tasks/PROMPT-FREEBUFF-UI-WR-B.md`, `tasks/PROMPT-FREEBUFF-UI-WR-C.md` —
    строка уже была на месте (проверено).

ШАГ 4 — Proof: `docs/ui-rules.md` существует; ссылка из
  `docs/AI-AGENT-GUIDE.md`; mention в `/kit/overview`
  (`frontend/src/app/pages/kit/kit-overview.page.ts` — блок «Агентам» с
  ссылкой на `docs/ui-rules.md`).

═══════════════════════════════════════════════════════════════
НЕ (соблюдено)
═══════════════════════════════════════════════════════════════

- Нет генератора CI/скрипта — ручной слепок v1, как в TZ.
- pi-dialog.service / desk / builder не тронуты.
- Не Storybook.

═══════════════════════════════════════════════════════════════
Proof
═══════════════════════════════════════════════════════════════

- Файл: `docs/ui-rules.md` — существует, таблица + запрещено + stop rule.
- Ссылка: `docs/AI-AGENT-GUIDE.md` строка «Перед UI: прочитай `docs/ui-rules.md`».
- Kit mention: `frontend/src/app/pages/kit/kit-overview.page.ts` блок «Агентам».
- WR-промпты: A (spent-архив) + B + C содержат строку «Перед UI: прочитай
  `docs/ui-rules.md`».
- Gates (orchestrator, до этого closeout):
  - `git diff --check` на тронутых путях — exit 0.
  - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0.
  - `eslint src/app/pages/kit/**/*.ts` — exit 0.

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
═══════════════════════════════════════════════════════════════

outcome: DONE
closed_at: 2026-08-23
closed_by: claude
verification:
  - acceptance criteria: PASS (ui-rules.md ≤120 строк + AI-AGENT-GUIDE ссылка +
    kit-overview mention + WR-A/B/C prompt line)
  - typecheck: PASS (tsc -p tsconfig.app.json --noEmit, exit 0)
  - tests: N/A (docs + kit static snapshot, no logic change)
  - lint: PASS (eslint src/app/pages/kit/**/*.ts, exit 0)
  - checklist: N/A (нет отдельного checklist-файла для этого TZ)
  - progress.md: N/A (docs-only micro-TZ)
  - status synchronization: `tasks/_active/TZ-UI-ROI-522.md` удалён этим
    коммитом; статус виден через archive
