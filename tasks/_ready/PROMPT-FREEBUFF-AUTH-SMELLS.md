# PROMPT — Freebuff continuous: Auth smells WAVE (product)

Ты executor (`agent_id: freebuff`). `D:\kppdf-8.0` main · UNATTENDED.

### Preflight
1. `Get-Location` + `git rev-parse` → корень репо.  
2. `tasks/_active/` пуст (QA umbrella archived). Иначе STOP.  
3. Читай: `GEMINI.md`, `docs/how-to-connect-ai.md`, `tasks/_ready/2026-09-17-auth-smells/WAVE-MAP.md`, три TZ A–C + KIT.  
4. Evidence gap: `docs/audits/2026-09-17-qa-checklist-2-blocked.md` (Auth section).

### Цепочка (по одной; IMPLICIT `nx build kppdf-web`)
0. `TZ-NX-AUTH-POSTLOGIN-HOME` — post-login + publicOnly → `/home`  
1. `TZ-NX-AUTH-PRIVACY-LINK` — убрать мёртвую `/legal/privacy` (не stub-страница)  
2. `TZ-NX-AUTH-DEMO-PASSWORD-TITLE` — title = фактический demo password (одна константа)  
3. `TZ-NX-KIT-AUTH-GUARD` — **PO default = Да**: повесь `authGuard` на parent `/kit`

Каждый TZ:
```
CLAIM первым (до кода):
1) tasks/_active/<TASK-ID>.md + checklist Claim slot (agent_id freebuff, claimed_at ISO, workspace)
2) Status CLAIMED; чужие keys / _active → STOP
3) Выполни TZ → gates → archive tasks/_archive/2026-09/<ID>.done.md + Executor report ≤15 lines
4) Commit своей зоны; затем next
```

### Gates (каждый TZ)
```
cd frontend-nx && pnpm exec nx build kppdf-web
# + focused tests/lint зоны из TZ
```

### НЕ
Deploy · wipe · dark redesign · audit docs rewrite · backend password seed · выдуманный legal text.

### STOP
`_active` empty · WAVE-MAP все 4 DONE · отчёт SHA + кратко что изменилось.
