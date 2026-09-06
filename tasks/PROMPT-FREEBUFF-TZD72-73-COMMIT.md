# PROMPT — Freebuff TZD-72/73 COMMIT+PUSH (crash left code uncommitted)

Скопируй целиком. **Не переписывай продукт** — код/доки уже на диске, сессия умерла до commit/push.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md.

═══ КРИТИЧЕСКИЙ ФАКТ ═══
TZD-71 committed locally: b064ea86 (может быть не на origin — проверь push).
TZD-72 + TZD-73 в checklist/archive помечены DONE, но КОД/ДОКУМЕНТЫ ЕЩЁ UNCOMMITTED.
_active пуст (маркер снят рано). НЕ начинай новую фичу. НЕ rewrite PairingDialog.

Uncommitted TZD-72 (stage по имени):
- backend: permissions.constants.ts, desktop-pairing.controller.ts(+.spec), rbac/permissions.guard.spec catalog pins
- frontend-nx/libs/data-access/src/lib/desktop/** (+ index export)
- frontend-nx/.../capabilities.metadata.ts, permission-labels.ru.ts, role-form-dialog (desktop group)
- frontend-nx/.../pages/desktop/** (PairingDialog)
- frontend-nx/.../layout/app-shell.component.ts(+.spec)
- docs: DOMAIN-MAP, FIC, admin-roles.page.md (если dirty от 72)
- docs/agent-checklists/TZD-72.md + tasks/_archive/2026-09/TZD-72.done.md

Uncommitted TZD-73:
- docs/CAPABILITY-LEDGER.md, docs/pages/registries.page.md, desktop/README.md
- docs/agent-checklists/WAVE-DESKTOP-EXCEL-NX-ALIGN.md (+ backlog WAVE if needed)
- docs/agent-checklists/TZD-73.md + tasks/_archive/2026-09/TZD-73.done.md

ЧУЖОЕ НЕ ТРОГАТЬ: .agents, docker-compose, unrelated docs WIP, crm_analytics, data/*.zip

═══ СДЕЛАТЬ ═══
1) git status / git log origin/main..HEAD. Если b064ea86 не на remote — push TZD-71 first.
2) Быстрый confirm: backend pairing tests + focused NX jest (desktop + app-shell) + nx build kppdf-web.
3) Commit 1 — feat(nx): TZD-72 Desktop pairing/download + desktop:admin RBAC (только 72 paths).
4) Commit 2 — docs: TZD-73 smoke + CAPABILITY-LEDGER + registries pointer + WAVE DONE (только 73 paths).
5) Проставь реальные SHA в TZD-72/73 checklist + archive; locks; _NOW Freebuff IDLE; wave STATUS DONE.
6) push. STOP + отчёт с SHA. Не S1/warehouse/Excel Form Studio rewrite.

Не спрашивай «продолжать?».
```
