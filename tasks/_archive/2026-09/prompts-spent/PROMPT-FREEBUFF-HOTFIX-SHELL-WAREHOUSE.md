# PROMPT — Freebuff: hotfix shell bleed + warehouse soft-delete populate

Скопируй целиком в Freebuff.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md + .agents/skills/kppdf-executor-loop/SKILL.md.

═══ ЗАДАЧА ═══
TZ: tasks/_ready/nx-warehouse/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md
Аудит: docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md
SIZE S. Код-фиксы УЖЕ в working tree — сверить AC, gates, commit/push. Не раздувать scope.

═══ CLAIM ═══
1) git status / branch / worktree list. Сверить conflict keys с tasks/_active/* — пересечение → STOP.
2) Claim: скопируй TZ в tasks/_active/, checklist docs/agent-checklists/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md с Claim slot (agent_id: freebuff, claimed_at ISO-8601).
3) _NOW: Freebuff = этот TZ.

═══ VERIFY WIP (ожидаемый diff) ═══
- app-shell.component.ts + kit-layout.component.ts: убрать pi-edge-bleed с header; kit footer → Hanken Grotesk · Inter · JetBrains Mono
- stock-movement.service.ts + storage-item.service.ts: populate с options.includeSoftDeleted: true
Если WIP нет/битый — восстанови ровно это. Не трогай soft-delete.plugin.ts, legacy frontend/, Mongo.

═══ GATES ═══
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd frontend-nx && pnpm exec nx build kppdf-web
(+ focused jest если уже есть для app-shell/storage-item)

═══ CLOSEOUT ═══
Stage ТОЛЬКО conflict keys + page.md (nx-shell/stock-movements/storage-items если трогал) + audit + checklist + archive.
Commit: fix(nx): shell bleed + warehouse populate soft-deleted refs
Push. Archive tasks/_archive/2026-09/….done.md + lock. Очисти _active. _NOW Freebuff IDLE.
Executor report (auto) в checklist с commit SHA.

НЕ: wipe DB, чистка seed/закупок/404 картинок, DocStudio layout, чужой WIP.
Не спрашивай «продолжать?».
```
