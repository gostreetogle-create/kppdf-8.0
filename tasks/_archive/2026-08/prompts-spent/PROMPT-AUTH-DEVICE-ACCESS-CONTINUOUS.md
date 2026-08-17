# AUTH rollout/cutover — запускать только по явному «деплой»

> 306/303/304 уже DONE. Этот prompt не реализует их повторно.
> Без слова PO `деплой` разрешён только read-only preflight и отчёт BLOCKED.

```text
Ты — senior DevSecOps/security executor kppdf-8.0.

SOURCE OF TRUTH
- GEMINI.md
- .agents/skills/kppdf-executor-loop/SKILL.md
- docs/PO-CANON.md
- docs/agent-checklists/_NOW.md
- docs/GIT-POLICY.md
- tasks/TZ-AUTH-305-device-access-rollout.md
- docs/agent-checklists/TZ-AUTH-305.md
- tasks/TZ-AUTH-307-auth-cutover-cleanup.md
- docs/ops/home-host-access.md §4
- deploy/synology/DEPLOY.md §15b

ТЕКУЩИЙ ФАКТ
- AUTH-306/303/304 находятся в main, но ещё не подтверждены на production.
- AUTH-305 ШАГ 1 prep/runbook выполнен; nginx switch и smoke НЕ выполнены.
- AUTH-307 запрещён до archived AUTH-305 + stable post-cutover PASS.
- Basic пока остаётся rollback-барьером.

HARD GATE
Если в текущем чате нет явного глагола PO «деплой / задеплой / кати»:
не запускай deploy.ps1, SSH, nginx reload и AUTH-307.
Ответ: «AUTH rollout подготовлен; жду явную команду деплой».

ФАЗА A — WARM APP DEPLOY, BASIC ОСТАЁТСЯ
1. Workspace/main/origin/dirty/conflict preflight.
2. Убедиться, что PREDEPLOY FINISH завершён либо PO явно выбрал deploy текущего main.
3. VPN OFF/LAN, deploy preflight PASS.
4. Warm deploy только WIPE=false.
5. Health/ready/FE/auth smoke; Basic не снимать.
6. При failure — rollback приложения по runbook, без DB wipe.

ФАЗА B — PRODUCT BROWSER SMOKE ПОД BASIC
1. Regular admin выбирает роль → invite → имя компьютера → immediate scoped entry.
2. F5/reopen сохраняет вход.
3. Role change/revoke действует ≤5 минут.
4. Ordinary admin не видит owner/owner-device controls.
5. Owner нажимает «Добавить мой компьютер» и регистрирует текущий owner browser.
6. Записать Cursor/PO browser PASS. Без owner device + PASS cutover запрещён.

ФАЗА C — TZ-AUTH-305 NGINX CUTOVER
1. CLAIM/heartbeat AUTH-305; не менять product code.
2. На VPS сохранить `kppdf-proxy.bak-auth-basic`; secrets не выводить/не коммитить.
3. Сначала открыть только enrollment surface.
4. Включить internal auth_request для UI; `/api` оставить JWT/kppd_ без redirect.
5. `nginx -t` + reload после каждого staged шага.
6. Smoke:
   - incognito без cookie не видит `/login`/ERP;
   - active regular/owner browser работает;
   - revoked/expired закрыт ≤5m;
   - OPTIONS/CORS без HTML/Basic challenge;
   - Desktop/MCP JWT и kppd_ PASS.
7. Failure: немедленно восстановить backup Basic config, `nginx -t`, reload.
8. Evidence без tokens/cookies/passwords → checklist → Cursor/PO PASS →
   archive/lock/progress/commit/push AUTH-305.

ФАЗА D — STABILITY STOP
После 305 не удаляй legacy auth в том же cutover-сеансе.
Зафиксируй stable window и остановись с карточкой:
AUTH-305 DONE/PASS, rollback path, HEAD, AUTH-307 READY/NOT READY.

ФАЗА E — AUTH-307, ТОЛЬКО ОТДЕЛЬНЫМ RESUME ПОСЛЕ STABILITY
1. CLAIM AUTH-307.
2. Route/header/cookie/caller inventory: KEEP | MIGRATE | REMOVE + evidence.
3. Удалить только доказанно dead public register, user-admin duplicate и
   Basic-specific browser workaround.
4. Сохранить owner password break-glass, device grant, JWT, Desktop kppd_.
5. Targeted auth/admin/desktop tests + browser smoke + security review.
6. Cleanup production config — только по новому явному «деплой», без wipe.
7. Archive/lock/progress/commit/push; wave DONE только после final PASS.

НИКОГДА
- wipe/reseed/drop DB;
- owner role/second owner;
- BrowserDeviceGrant as Bearer;
- Basic removal before owner device + browser PASS;
- AUTH-307 до stable AUTH-305;
- tokens/passwords/cookies в evidence/git.
```
