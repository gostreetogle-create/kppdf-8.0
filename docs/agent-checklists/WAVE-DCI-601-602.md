# WAVE checklist — DCI 601+602

Status: **IN_PROGRESS**
agent_id: `claude`
started_at: `2026-08-31T20:07:13+03:00`
**RESUME:** пункт 3 — TZ-UI-DCI-602 код (baseline green)

## Волна

- [x] 0. Master-чеклист заполнен (agent_id, started_at, RESUME)
- [x] 1. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (2026-08-31, exit 0; existing Angular budget warnings)
- [x] 2. **TZ-UI-DCI-602** CLAIM (`tasks/_active/` + `docs/agent-checklists/TZ-UI-DCI-602.md`)
- [ ] 3. TZ-UI-DCI-602 код (pi-focus-ring coverage + tri-state segmented + docs)
- [ ] 4. TZ-UI-DCI-602 gates → archive → commit/push → очистить `_active`
- [ ] 5. **TZ-UI-DCI-601** CLAIM
- [ ] 6. TZ-UI-DCI-601 код (PiFlowDiagram + kit demo)
- [ ] 7. TZ-UI-DCI-601 tests + `nx build kppdf-web` → archive → commit/push
- [ ] 8. QUEUE-LIVE + `_NOW.md` → DCI DONE; Status этого файла = DONE
- [ ] 9. Отчёт PO одной строкой

### TZ-UI-DCI-602

- Claim: [x] `tasks/_active/TZ-UI-DCI-602.md`, checklist claim slot заполнен
- Code: [ ] audit kit focus coverage; add tri-state segmented utility; update passport/docs
- Gates: [ ] `nx build kppdf-web` last, optional paper-and-ink tests if needed
- Archive: [ ] `tasks/_archive/2026-08/TZ-UI-DCI-602.done.md`; remove active marker
- Commit: [ ] focused commit and push after green gates

### TZ-UI-DCI-601

- Claim: [ ] after 602 archive, active marker + checklist claim slot
- Code: [ ] `PiFlowDiagram` with ResizeObserver, accessible nodes, kit RU demo, docs
- Gates: [ ] focused flow-diagram tests; `nx build kppdf-web` last
- Archive: [ ] `tasks/_archive/2026-08/TZ-UI-DCI-601.done.md`; remove active marker
- Commit: [ ] focused commit and push after green gates

## Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `tasks/PROMPT-FREEBUFF-DCI-601-602.md`, `tasks/TZ-UI-DCI-602-focus-segmented.md`, `tasks/TZ-UI-DCI-601-flow-diagram.md`, `docs/agent-checklists/TZ-UI-DCI-602.md`, `docs/agent-checklists/TZ-UI-DCI-601.md`, `docs/agent-checklists/WAVE-DCI-601-602.md`, `.agents/skills/kppdf-project/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `docs/ui-rules.md`, `docs/DARK-THEME.md`, `docs/paper-and-ink.md`, `docs/audits/2026-08-31-dark-control-interface-audit.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/AGENT-TASK-MODES.md`, `docs/DOCS-INTEGRITY.md`, `docs/GIT-POLICY.md`
- **Key Constraints:** continuous executor on `D:\kppdf-8.0` / `main`; `agent_id: claude`; no competing `_active` conflict keys; frontend-nx only; gold canon; no violet/ice/Onest/canvas; no mid-wave confirmation; build is the last gate command.
- **Planned Deliverable:** (1) baseline and inspect existing kit primitives, (2) complete 602 focus/segmented coverage and docs, (3) gate/archive 602, (4) implement and verify 601 flow primitive and kit demo, (5) closeout wave state and archives.
- **Validation Path:** TZ acceptance criteria; `nx build kppdf-web` for each TZ as final command, focused `paper-and-ink` flow tests for 601, primary kit/DOM verification where available, Integrity slots, `QUEUE-LIVE.md`, `_NOW.md`, progress/status sync, focused diff review.

## Запреты волны

- Не DocStudio S8 · не 603–605 · не deploy/wipe · не violet/ice/Onest/canvas
- Не ждать «продолжай» mid-wave

## Current evidence

- HEAD at claim: `f67327636cdb24d3dae121dc200c38e0218f8bec`
- Queue DCI empty: **no — 602 and 601 remain in progress**
