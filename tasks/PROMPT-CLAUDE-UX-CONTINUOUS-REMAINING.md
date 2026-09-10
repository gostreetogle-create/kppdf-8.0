# PROMPT — Claude: добить текущий claim → continuous UX (хвост)

Скопируй **целиком** в чат, даже если агент ещё на старом промпте.  
Сначала закрывает текущую работу, **потом** continuous.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ ФАЗА 0 — СНАЧАЛА ДОБЕЙ ТЕКУЩИЙ ПРОМПТ / CLAIM ═══
НЕ бросай WIP. НЕ начинай #09+ пока фаза 0 не закрыта.

1) git status + tasks/_active/* — что claim / uncommitted.
2) Если claim / код mid-task (сейчас типично TZ-NX-UX-08b):
   - доведи AC TZ до конца (для 08b: rg 'class="pi-button' pages → 0; audit; gates);
   - claim slot заполнен → gates (nx test/build как в TZ) → archive TZ → commit → push;
   - sync WAVE / _NOW / docs/agent-checklists/UX-SWEEP-CONTINUOUS-CHECKLIST.md
     (для 08b: Status=DONE + SHA; status continuous = RUNNING).
3) Если WIP чужой / красный baseline / wipe-deploy → STOP + Executor report (чеклист BLOCKED).
4) Только после полного closeout фазы 0 → ФАЗА 1.

═══ ФАЗА 1 — CONTINUOUS UX SWEEP ═══
Canon: docs/audits/2026-09-09-nx-ux-page-sweep-canon.md
WAVE: docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md
ЖИВОЙ ЧЕКЛИСТ: docs/agent-checklists/UX-SWEEP-CONTINUOUS-CHECKLIST.md
Эталон: /registries expand; кнопки = <app-pi-button>; .pi-outline-btn живой.

Чеклист:
- Старт стадии → IN_WORK (одна строка).
- Конец → DONE+SHA+время | SKIP | BLOCKED→STOP.
- Resume = первая PENDING/IN_WORK; DONE не переделывай.
- Если 08b уже DONE в чеклисте/WAVE с SHA — не повторяй, иди на 09.

Очередь (строго):
08b) …/pi-button-sweep/TZ-NX-UX-08b…  — только если ещё не DONE после фазы 0
09)  …/storage-items/ AUDIT→FIX
10)  …/stock-movements/ AUDIT→FIX
11)  SKIP Гант /production — отметь SKIP, не claim
12)  …/proposals/
13)  …/counterparties/
14)  …/contracts/
15)  …/studio-list/  (list+templates only, НЕ A4 editor)
16)  …/admin-devices/
17)  …/admin-roles/

Page-волна: AUDIT без кода → PASS-EMPTY|PASS-FIX → FIX своей страницы.
Запах mid-fix на ЭТОЙ странице — чини + closeout в audit.
После волны: claim→gates→archive→commit→push→чеклист→WAVE→next. Без «продолжать?».

Финал: чеклист COMPLETE; _NOW Claude IDLE; Executor report #→SHA.

НЕ: /production; BE rewrite; desk; wipe; deploy без PO; чужой WIP; два page FIX параллельно.
```
