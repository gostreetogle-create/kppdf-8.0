# Freebuff-1 — Closeout: KP-410 + smoke + hygiene

> **2026-08-23 closeout.** KP/DEN/409 **DONE** на main. Твоя полоса — **410 → smoke → tasks hygiene**.  
> Freebuff-2 параллельно на **354 Gantt** — не трогай `production/**`.

## Старт (один раз)

```text
cd D:\kppdf-8.0
git pull --ff-only
git status
```

`GEMINI.md` · `kppdf-executor-loop` · `docs/PO-CANON.md` · `docs/pages/kp-workspace-geometry.md`

## 1) TZ-KP-WS-410 — дожать hotfix

Spec: `tasks/TZ-KP-WS-410-hotfix-empty-viewport.md`

**Уже в main (DEN-552):** flex chain + empty state + `onSheetClick` в `proposal-workspace.page.ts`.

**Осталось закоммитить (проверь diff):**
- `proposal-workspace-draft.service.ts` — `resumeLastDraft()` без draft → `resumeLastTemplate()` (не `removeStorage`)
- `proposal-workspace.page.spec.ts` — 3 теста empty/filled sheet
- `deals-group-chips.ts` + spec — chip «Коммерческое предложение» → `/proposals/workspace`

CLAIM → `_active/TZ-KP-WS-410.md` · `agent_id: freebuff-1`

Gates:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm test -- proposal-workspace deals-group-chips --runInBand
pnpm lint
```

Archive → `tasks/_archive/2026-08/TZ-KP-WS-410.done.md`  
Commit: `fix(kp): workspace empty viewport hotfix (KP-WS-410)` · push

## 2) Full KP smoke (dev servers)

```bash
cd D:\kppdf-8.0 && node start.mjs --no-browser
```

Прогон: `docs/agent-checklists/KP-WORKSPACE-SMOKE.md` (10 шагов) + 3 риска.  
Evidence: обнови `docs/qa/kp-workspace-manager-smoke.md` (PASS/FAIL по строкам).  
Нужен backend — если VPN/DB нет, зафиксируй BLOCKED + что автотесты PASS.

Commit docs-only если менял evidence · push

## 3) Tasks hygiene (корень tasks/)

Удалить/перенести в `_archive/2026-08/specs-dup-root/` **уже archived** specs в корне:
`TZ-KP-WS-400.md` … `409.md` (если есть `.done.md` в archive).

`_active/` должен быть пуст между задачами.

Commit: `chore(tasks): archive stale KP-WS root specs` · push

## STOP

Deploy без PO. Не `production/**`. Не DEN backlog.
