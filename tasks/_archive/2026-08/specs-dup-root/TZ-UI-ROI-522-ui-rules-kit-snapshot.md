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

Проверено: WR-506 — routes + passports в kit pages; агентам нужен один Markdown
  слепок, не Storybook.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Passports размазаны комментариями по kit-страницам. Freebuff/Claude не видят
единый «что звать / что нельзя» в каждом промпте.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Создать `docs/ui-rules.md` (коротко, ≤120 строк):
  - Таблица: примитив → import/service → когда использовать → anti-use.
    Минимум: PiDialogService, PiSheetService, PiDrawerService, PiOverflowSelect,
    native select, PiButton, ErrorBanner, Skeleton, Toast, DropdownMenu.
  - Блок ЗАПРЕЩЕНО: новый overlay через `absolute`/`fixed` в feature; новый
    UI-элемент вне shared/ui без TZ архитектора; Material.
  - Правило: нет в таблице → STOP, просить архитектора (не кодить сам).

ШАГ 2 — Источник правды = живые `/kit/*` passports; при расхождении править
  kit комментарий И ui-rules (один коммит).

ШАГ 3 — Вшить одну строку в Freebuff WR-промпты + `AI-AGENT-GUIDE.md`:
  «Перед UI: прочитай `docs/ui-rules.md`».

ШАГ 4 — Proof: файл; ссылка из guide; mention в kit overview (routerLink или
  текст «агентам: docs/ui-rules.md»).

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Не генератор CI/скрипт обязателен в v1 (ручной слепок ок).
- Не трогать pi-dialog.service / desk / builder.
- Не Storybook.

Verification: `git diff --check`; при правке kit TS —
`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`

Finalization: `tasks/_archive/YYYY-MM/TZ-UI-ROI-522.done.md`
