# PROMPT — Freebuff: RESUME B orphan clean (finish only)

Сессия зависла в loop mid-apply. Скрипт уже есть. Закрой B и СТОП.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?». Не начинай Chrome IA / DocStudio.

═══ ФАКТ ═══
TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN CLAIMED (freebuff, 2026-09-06T11:27:46+03:00).
Скрипт УЖЕ есть: scripts/clean-local-demo-orphans.mjs (batch array-index removals — не чинить index-shift заново).
Dry-run уже посчитан в checklist:
  supply orphans 5 · stock-movement 6 · studio broken images 7
Applied / archive / commit — НЕ сделаны. Предыдущая сессия loop → продолжай с apply.

═══ СДЕЛАТЬ (только closeout B) ═══
1) Не переписывать скрипт с нуля. Если нужен микрофикс — только баг apply, потом сразу --apply.
2) node scripts/clean-local-demo-orphans.mjs          # подтвердить counts ≈ checklist
3) node scripts/clean-local-demo-orphans.mjs --apply  # local Mongo only
4) Повторный dry-run → orphans ≈ 0 (или зафиксируй остаток + почему)
5) Если экраны дырявые — node scripts/seed-local-demo.mjs
6) Checklist Applied + Gates; audit «data residue» → CLEANED; archive TZ; lock; очисти tasks/_active от B
7) Commit ТОЛЬКО: scripts/clean-local-demo-orphans.mjs + checklist/audit/archive/lock/_NOW
   Push. _NOW Freebuff IDLE. Executor report (auto): counts before/after + SHA.

ЗАПРЕЩЕНО: dropDatabase; prod; Chrome C*; S45/S46; warehouse/shell code; desktop; чужой WIP; бесконечный refactor скрипта.
Один проход apply → verify → archive → commit → STOP.
```
