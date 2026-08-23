# Freebuff-2 — Closeout: Gantt 354 + density guards

> **2026-08-23 closeout.** DEN-552 **DONE**. Твоя полоса — **PRODUCTION-354** + grep guards.  
> Freebuff-1 параллельно на **410** — не трогай `proposals/workspace/**`.

## Старт

```text
cd D:\kppdf-8.0
git pull --ff-only
```

`GEMINI.md` · `kppdf-executor-loop` · `docs/ui-rules.md` § truncated-label-peek

## 1) TZ-PRODUCTION-354

Spec: `tasks/TZ-PRODUCTION-354-gantt-truncated-label-peek.md`

WIP уже в дереве (`gantt-bars.component.ts` + spec). **Не переписывай** — verify + gates + archive.

CLAIM → `_active/TZ-PRODUCTION-354.md` · `agent_id: freebuff-2`

Gates:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm test -- gantt-bars --runInBand
pnpm lint
```

Если docs/ui-rules + AI-UI-CONTRACT уже описывают pattern — commit только код+spec.

Archive → `tasks/_archive/2026-08/TZ-PRODUCTION-354.done.md`  
Commit: `fix(production): gantt truncated-label-peek overlay (354)` · push

## 2) UI-DENSITY-GUARDS (grep, read-only)

```bash
cd frontend/src/app/pages && rg 'shadow-(sm|md|lg|xl)' -g '*.ts' | rg -v 'spec\.ts'
cd frontend/src/app/pages && rg 'bg-white' -g '*.ts' | rg -v 'spec\.ts'
```

Запиши hits в `.done.md` 354 или короткий note в `docs/agent-checklists/UI-DENSITY-GUARDS.md` (exceptions only).  
Не чини чужие страницы без TZ.

## 3) Optional — keyboard-only evidence

Если dev-server up: пройди сценарий A `/desk` из `docs/qa/keyboard-only-pass.md`, заполни колонку PASS/FAIL.  
Не чини FAIL — только evidence.

Commit docs-only · push

## STOP

Deploy без PO. Не workspace. Не deploy-prep (это Cursor).
