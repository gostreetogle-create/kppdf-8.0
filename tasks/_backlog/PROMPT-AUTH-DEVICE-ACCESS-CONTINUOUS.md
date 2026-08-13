# Непрерывный промпт — вход по именованному компьютеру

> Для PO: копировать агенту блок ниже целиком. Этот же блок использовать после любого обрыва. История чатов не нужна: правда в git/checklists.

```text
Ты — непрерывный senior security/full-stack исполнитель kppdf-8.0.

ЦЕЛЬ
Реализовать полностью WAVE-AUTH-DEVICE-ACCESS:
администратор заранее выбирает готовую роль → создаёт одноразовую ссылку →
человек вводит только имя компьютера → этот браузер сразу работает строго
в подготовленной роли без логина/пароля и помнится 365 дней.

Единственный hidden owner (PO) может создать owner-only ссылку «Добавить мой
компьютер» и подключить рабочий ПК к тому же owner User. Второй owner никогда
не создаётся. Ordinary admin не видит owner, его устройства и owner-only права.

SOURCE OF TRUTH
- origin/main
- GEMINI.md
- .agents/skills/kppdf-project/SKILL.md
- .agents/skills/kppdf-executor-continuous/SKILL.md
- OrchestratorKit/AGENTS.md
- docs/PO-DIARY.md §1–§4
- docs/ops/home-host-access.md §4
- tasks/_backlog/WAVE-AUTH-DEVICE-ACCESS.md
- docs/agent-checklists/_active-map.md
- tasks/_backlog/QUEUE.md

══════════════════════════════════════════════════════════════
WORKSPACE + RESUME GATE — СРАЗУ
══════════════════════════════════════════════════════════════

1. Выполни:
   Get-Location
   git rev-parse --show-toplevel
   git branch --show-current
   git status --short
   git fetch origin

2. Рабочая правда должна быть D:\kppdf-8.0/main или изолированный worktree,
   который способен доставить commit в origin/main.

3. Не удаляй и не коммить чужие:
   - data/from-kp3/__pycache__/
   - ruvector.db
   - чужой dirty WIP

4. Прочитай верхние checkpoint в `_active-map`, затем весь `tasks/_active/`.

5. Если текущая TZ уже CLAIMED:
   - прочитай её checklist, git diff, последние commits и Team Room status;
   - продолжай с первого незакрытого acceptance/gate;
   - не переписывай готовое и не создавай второй параллельный flow.

6. Если claim остался после оборвавшегося агента:
   - убедись, что живого heartbeat/процесса нет;
   - зафиксируй takeover в checklist и Team Room;
   - продолжай существующий diff/commit, не начинай TZ заново.

7. Если `_active/` пуст — бери следующий незакрытый ID строго по порядку:
   TZ-AUTH-306 → TZ-AUTH-303 → TZ-AUTH-304 → TZ-AUTH-305 → TZ-AUTH-307.

8. До первой правки каждой TZ:
   - прочитай task-файл целиком;
   - сравни CONFLICT KEYS со всеми active;
   - создай `tasks/_active/<ID>.md`;
   - заполни `docs/agent-checklists/<ID>.md`: Status, Claim slot,
     agent_id, claimed_at ISO, workspace, team_room_claim;
   - Team Room join/inbox/claim best-effort.
   Без claim slot product-код не менять.

══════════════════════════════════════════════════════════════
ЖЁСТКИЕ АРХИТЕКТУРНЫЕ ИНВАРИАНТЫ
══════════════════════════════════════════════════════════════

1. Устройство — субъект входа. Не собирать ФИО/email/login/password.
   Получатель вводит только «Как назвать этот компьютер?».

2. Regular invite создаётся ТОЛЬКО после выбора существующей активной Role.
   Role хранится server-side в invite и не принимается от public activation.
   После активации нет момента «увидел всё, потом закрыли»: доступ с первого
   API-запроса строго ограничен заранее выбранной ролью.

3. Owner:
   - ровно один существующий bootstrap owner;
   - owner — immutable `isOwner`, не роль и не permission checkbox;
   - owner всегда имеет полный доступ;
   - ordinary admin не видит/не перечисляет/не изменяет owner;
   - owner-only permissions отсутствуют в role picker;
   - owner может подключить второй компьютер только owner-only self-link,
     связанный с тем же User; второй owner не создаётся.

4. Browser credential:
   - Invite и BrowserDeviceGrant — разные сущности;
   - plaintext secrets не хранить;
   - cookie Secure + HttpOnly + SameSite + __Host-, default 365d;
   - BrowserDeviceGrant никогда не принимается как Authorization Bearer,
     X-Access-Token, JWT или Desktop pairing key;
   - device app JWT короткий ≤5m, без long refresh; renew только по grant-cookie;
   - revoke/role change вступает в силу максимум за 5 минут.

5. Desktop/MCP:
   - backend/src/modules/desktop/** и `kppd_` semantic не менять;
   - `/api` не закрывать Basic, HTML redirect или обязательной browser-cookie;
   - JWT/`kppd_` regression tests обязательны.

6. Внешний барьер:
   - nginx auth_request только через internal location;
   - Basic не снимать, пока 306+303+304 не зелёные и browser smoke не PASS;
   - сначала новый путь рядом со старым, затем cutover, затем cleanup;
   - password login owner сохранить как break-glass.

7. Никогда:
   - IP binding;
   - общий секрет на всех;
   - вечный invite;
   - GET consume;
   - owner role в DTO/UI;
   - public self-registration после cleanup;
   - wipe/reseed;
   - удаление старого auth до доказанного нового и rollback.

══════════════════════════════════════════════════════════════
ПОРЯДОК РЕАЛИЗАЦИИ
══════════════════════════════════════════════════════════════

ЭТАП 1 — TZ-AUTH-306
Единственный hidden owner, server-side immutable invariant, role editor
owner-only, защита от enumeration/escalation. Без device flow.

ЭТАП 2 — TZ-AUTH-303
Backend regular invite с preselected Role, owner-device self-link,
BrowserDeviceGrant, 365d cookie, JWT ≤5m, audit/revoke. Desktop не трогать.

ЭТАП 3 — TZ-AUTH-304
UI `/enroll/:token`: одно поле имени → immediate scoped entry.
Admin `/admin/devices`: выбрать роль → создать/копировать ссылку →
изменить роль/срок → отключить устройство.
Только owner видит «Добавить мой компьютер».

ЭТАП 4 — TZ-AUTH-305
Это production rollout. НЕ запускать без явного слова PO «деплой» в текущем
чате. До команды: подготовить config/runbook/evidence и остановиться
«готово к деплою». После команды: auth_request → smoke → снять Basic.
WIPE=false. При сбое вернуть Basic, не чинить prod вслепую.

ЭТАП 5 — TZ-AUTH-307
Только после PASS cutover. Сначала caller/route/header/cookie inventory.
Затем удалить public `/auth/register`, дубли user-admin API, dead DTO/routes/
tests/docs и доказанно ненужный Basic-specific browser workaround.
Сохранить owner password break-glass, BrowserDeviceGrant, JWT и Desktop kppd_.

══════════════════════════════════════════════════════════════
ЦИКЛ КАЖДОЙ TZ
══════════════════════════════════════════════════════════════

CLAIM → короткий план в checklist → реализация минимальным scope →
targeted tests/typecheck/lint → security self-review diff →
browser/DOM smoke для UI → заполнить Integrity slot →
READY FOR REVIEW → Cursor/PO PASS если требует TZ →
archive + lock + progress + ARCHITECTURE/page docs →
удалить active marker → commit + push origin/main →
checkpoint в `_active-map` → сразу NEXT.

Не ждать «поехали» между 306/303/304.

Для крупного зелёного подэтапа:
- targeted gates PASS;
- отдельный осмысленный commit + push;
- checklist: что готово, SHA, следующий точный пункт;
- checkpoint так, чтобы новый агент продолжил без прошлого чата.

Коммиты:
- только файлы текущей TZ;
- conventional message;
- hooks не обходить;
- после каждой закрытой TZ commit+push обязателен;
- не amend чужие/уже pushed commits;
- не force-push.

══════════════════════════════════════════════════════════════
ОБЯЗАТЕЛЬНЫЕ ПРОВЕРКИ ВОЛНЫ
══════════════════════════════════════════════════════════════

- Backend/frontend strict typecheck.
- Targeted auth, owner, admin users/roles, enrollment, interceptor tests.
- Desktop pairing regression.
- Relevant lint + architecture check + git diff --check.
- Security tests: one-time/atomic invite, no token plaintext/log leak,
  owner enumeration/escalation, role tampering, revoked/expired grant,
  CSRF/Origin, no BrowserGrant-as-Bearer.
- Browser smoke:
  A) regular role → link → name → immediate correct pages only;
  B) F5/reopen → automatic entry;
  C) role change/revoke → effect ≤5m;
  D) owner home session → 15m self-link → work browser → same owner;
  E) ordinary admin cannot see owner or owner-device UI;
  F) incognito without grant cannot see login/ERP after cutover.
- Desktop/MCP smoke after nginx change.
- Rollback Basic documented and tested without wipe.
- Cleanup inventory proves every removed route/header has no live caller.

══════════════════════════════════════════════════════════════
СТОП-УСЛОВИЯ
══════════════════════════════════════════════════════════════

СТОП и одна короткая фраза PO только если:
- живой conflict-key claim;
- невозможно однозначно определить текущего bootstrap owner;
- нужен секрет/опасная необратимая операция;
- production deploy, но PO не сказал явно «деплой»;
- wipe/drop/rm данных — этой волне не нужны;
- acceptance невозможно выполнить без изменения утверждённой модели.

Обычный обрыв агента НЕ blocker: commit/checklist/checkpoint → следующий агент
получает этот же prompt и продолжает.

Волна DONE только когда 306/303/304/305/307 имеют archives, locks, green gates,
commits на origin/main, новый regular+owner-device flow проверен, Basic снят
с rollback evidence, Desktop/MCP жив, старые дубли удалены по inventory.
```
