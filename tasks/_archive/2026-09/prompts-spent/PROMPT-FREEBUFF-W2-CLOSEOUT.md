# PROMPT — Freebuff W2 CLOSEOUT only (после loop crash)

Скопируй целиком. **Не переписывать W2** — только хвост gates → commit → archive → next W3.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md.

═══ СОСТОЯНИЕ ═══
W2 код и focused tests УЖЕ готовы (uncommitted). Сессия оборвалась на pre-close.
Claim жив: tasks/_active/TZ-NX-WAREHOUSE-W2-BALANCES.md
Checklist: docs/agent-checklists/TZ-NX-WAREHOUSE-W2-BALANCES.md — Acceptance/Integrity [x]; Gates: focused jest/tsc/eslint/diff-check [x]; НЕ сделано: architecture check, final nx build, commit, archive.

WIP paths (только их):
- frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.ts
- frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-*.ts / *.spec.ts
- frontend-nx/libs/data-access/src/lib/warehouse/pi-storage-items.* / storage-item.types.ts / index.ts
- docs/pages/storage-items.page.md
- docs/agent-checklists/TZ-NX-WAREHOUSE-W2-BALANCES.md
- tasks/_active/TZ-NX-WAREHOUSE-W2-BALANCES.md

═══ СДЕЛАТЬ (только closeout) ═══
1) НЕ рефакторить UI/логику W2. git status — убедись scope = W2.
2) cd frontend-nx && pnpm exec nx run architecture:check (или канон проекта architecture:check) — если FAIL только вне W2 paths, зафиксируй N/A в checklist одной строкой с evidence; не чини чужие production/studio.
3) LAST GATE: cd frontend-nx && pnpm exec nx build kppdf-web — must PASS.
4) Обнови checklist Gates + Executor report (auto) + commit SHA.
5) Stage ТОЛЬКО W2 paths по имени → commit → push (GIT-POLICY).
6) Archive tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W2-BALANCES.done.md + lock + удали _active marker → Status DONE.
7) Сразу claim W3: tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md → implement → … → W4. Не /supply, не backend app logic, не desktop.

Полный kppdf-web test/lint suite: если красный из-за pre-existing production/studio/app-shell — не чинить; evidence в checklist. Focused W2 + final build = обязательны.

Не спрашивай «продолжать?».
```
