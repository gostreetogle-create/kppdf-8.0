═══════════════════════════════════════════════════════════════
TZ-OPS-311: architecture-check — убрать shared→pages BOM
═══════════════════════════════════════════════════════════════

> docs/TZ-AUTHORING.md: docs/ops tooling; no Counterparty schema change.
> Проверено: scripts/architecture-check.mjs; baseline keys include
> frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts
> → pages/products/product-bom-panel.component; docs/CAPABILITY-LEDGER.md;
> docs/AGENT-TASK-MODES.md; ARCHITECTURE.md §1a.

РОЛЬ АГЕНТА: Frontend Component Engineer (+ thin shared extract)

ЗАВИСИМОСТИ: Нет (gate уже на main после Cursor adopt). Этот TZ чинит
известное baseline-нарушение, не добавляет новые правила.

LAYER: 3

CONFLICT KEYS: frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts; frontend/src/app/pages/products/product-bom-panel.component.ts; frontend/src/app/shared/ui/** (только если extract); scripts/architecture-check.baseline.json; docs/agent-checklists/TZ-OPS-311.md

PAGES: n/a (shared quick-create / product BOM panel wiring)
PAGE_DOCS: n/a

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `pnpm architecture:check` сравнивает нарушения с
   `scripts/architecture-check.baseline.json`.
2. Правило `fe-shared-must-not-import-pages`: shared UI не должен
   импортировать `pages/*`. Сейчас quick-create тянет
   `ProductBomPanelComponent` из pages/products — в baseline.
3. Цель: вынести/прокинуть BOM panel так, чтобы shared не импортировал
   pages; обновить baseline (--write-baseline) только после удаления
   этого ключа; check зелёный без роста baseline.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Выбрать минимальный extract

  Под-шаг 1.1: Прочитай quick-create-dialog и product-bom-panel —
  что именно нужно quick-create (inputs/outputs).
  Под-шаг 1.2: Предпочтение A: перенести panel (или тонкий wrapper) в
  `frontend/src/app/shared/` (например shared/catalog или shared/ui),
  pages/products реэкспортирует/использует shared.
  Предпочтение B (если A слишком широко): quick-create принимает
  BOM panel через `input`/content projection/`ng-template` от caller
  (page), без import pages внутри shared.
  Под-шаг 1.3: Не плодить второй write-path состава (PO-DIARY).

ШАГ 2: Правки + тесты зоны

  Под-шаг 2.1: Обнови imports callers (product forms / quick-create specs).
  Под-шаг 2.2: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
  Под-шаг 2.3: точечные jest по quick-create / bom panel если есть.

ШАГ 3: Gate + baseline refresh

  Под-шаг 3.1: `pnpm architecture:check --write-baseline` только если
  ключ shared→pages ушёл и новых ключей нет (сверь diff baseline).
  Под-шаг 3.2: `pnpm architecture:check` → PASS.
  Под-шаг 3.3: Checklist + Integrity; archive root tasks.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/shared/ui/quick-create/** (убрать pages import)
- frontend/src/app/pages/products/product-bom-panel* и callers по необходимости
- optional new shared path for panel
- scripts/architecture-check.baseline.json (shrink only)
- docs/agent-checklists/TZ-OPS-311.md
- progress.md / STATUS.md при closeout

НЕ ИЗМЕНЯТЬ:
- backend/**
- Новые правила в architecture-check.mjs (отдельный TZ)
- CAPABILITY-LEDGER semantics (кроме note если нужно)
- deploy / wipe

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `quick-create-dialog.component.ts` не импортирует ничего из `pages/`.
2. Состав/BOM в quick-create по-прежнему работает (один write-path).
3. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS.
4. `pnpm architecture:check` PASS; baseline не вырос; ключ
   fe-shared-must-not-import-pages для quick-create удалён.
5. Executor report (auto) ≤15 lines; archive
   `tasks/_archive/2026-08/TZ-OPS-311.done.md`.

known_limitation: другие page↔page component imports (если появятся в
baseline) — successor TZ; не раздувать scope.

Финализация: root `tasks/_archive/2026-08/` + GEMINI.md; Cursor/PO review
если Layer-3 shared тронут широко.
