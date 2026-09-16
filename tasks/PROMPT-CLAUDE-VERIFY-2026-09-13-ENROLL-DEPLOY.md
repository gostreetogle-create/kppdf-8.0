# PROMPT — Claude: VERIFY enroll + fresh VM .52 (2026-09-13)

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace D:\kppdf-8.0.

=== UNATTENDED ===
PO AFK. Не спрашивай «продолжать?», «можно commit?», «ок?».
Claim → шаги TZ до конца → gates → archive/commit/push по Finalization TZ → отчёт.
Секреты/пароли/токены в чат и в evidence НЕ писать.
=== /UNATTENDED ===

ЗАДАЧА (одна): tasks/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.md
Контекст desk-аудита: docs/audits/2026-09-13-fresh-vm52-rebuild.md

1) git status / branch / worktree list. tasks/_active/ пуст или STOP при пересечении conflict keys.
2) CLAIM: скопируй TZ в tasks/_active/ + checklist Claim slot (agent_id: claude, claimed_at ISO).
3) Выполни ШАГИ 1–7 TZ строго. Product-код НЕ трогать.
4) Артефакты только:
   - docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md
   - docs/agent-checklists/evidence/VERIFY-2026-09-13-ENROLL-DEPLOY.txt
5) Если FAIL/новый баг — НЕ чинить: successor-TZ в tasks/_ready/ + WARN в отчёте.
6) После вердикта: синхронизируй docs/agent-checklists/_NOW.md (Deploy/Claude статус по факту) и строку STREAM-QUEUE.md — без эссе.
7) Доп. WARN (не блокер VERIFY, но зафиксировать в checklist):
   - stale 192.168.1.103 в docs/ops/home-host-access.md, PROMPT-ACCESS-METHOD-DEBATE.md, RUNBOOK-CLEAN-SYNLOGY-KP3-LOAD.md
   - cloudflared legacy-строка в deploy/synology/CREDENTIALS.example.md
   Если VERIFY = PASS — заведи SIZE S successor: tasks/_ready/TZ-OPS-DOCS-HOST-52-SYNC.md (только эти ops-доки → .52; conflict keys только docs/ops/* + CREDENTIALS.example.md). Не правь их в этой VERIFY.
8) Commit+push только отчётных файлов (+ _NOW/STREAM если трогал) по Finalization TZ.
9) Отчёт PO: PASS|FAIL|WARN матрица + SHA чеклиста. Пароли не печатать.

ЗАПРЕЩЕНО: deploy.ps1, wipe, правки frontend-nx/backend, commit секретов, «заодно» product-фичи.
```
