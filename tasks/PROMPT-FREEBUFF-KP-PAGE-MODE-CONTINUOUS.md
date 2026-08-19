# PROMPT — Freebuff: KP page mode finish (380 → 377 → deploy gate)

Repo: `D:\kppdf-8.0` · Executor: `GEMINI.md` · **не** OrchestratorKit.

## Порядок (строго)

1. **TZ-SALES-380** — `tasks/_backlog/kp-vitrine/TZ-SALES-380-kp-template-page-break-defaults.md`
2. **TZ-SALES-377** — `tasks/_backlog/kp-vitrine/TZ-SALES-377-kp-continuation-background-table.md`
3. Gates (ниже) → commit/push → STOP (deploy делает Cursor/PO)

## НЕ

- `_park/**`, desk wave, builder transient-block P0 (отдельный TZ)
- TZ-SALES-326/328 (витрина) — после page mode
- Wipe deploy

## Gates после каждой TZ

```powershell
cd D:\kppdf-8.0\backend
pnpm exec tsc -p tsconfig.build.json --noEmit
pnpm exec jest --runInBand document-template

cd D:\kppdf-8.0\frontend
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm exec jest --config jest.config.js --runInBand --testPathPattern="proposal-create|builder-inspector"
pnpm exec ng build --configuration=production
```

## Финализация (root TZ)

- `tasks/_archive/2026-08/TZ-SALES-NNN.done.md`
- `.mimocode/locks/TZ-SALES-NNN-*.lock`
- `docs/agent-checklists/TZ-SALES-NNN.md`
- `progress.md` запись
- commit + push `main`

## 377 hint (из аудита)

В `document-template.service.ts` loop `pageIndex > 0`: drop non-line-items blocks
(кроме фона `.doc-bg`). Last page — totals + terms как сейчас.
