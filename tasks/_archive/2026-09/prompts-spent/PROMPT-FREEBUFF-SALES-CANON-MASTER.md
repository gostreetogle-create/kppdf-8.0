# PROMPT — Freebuff: NX Sales canon S30→S39 (10 TZ continuous)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md · docs/CONTEXT.md

WAVE-CHECKLIST (SoT прогресса — открыть ПЕРВЫМ):
  docs/agent-checklists/WAVE-NX-SALES-CANON.md

Начни с ПЕРВОЙ строки chain где [ ] (не [x]). Пропускай уже [x].

Roadmap: docs/architecture/nx-sales-canon-roadmap.md

═══ ЖЁСТКО: НЕ ОСТАНАВЛИВАТЬСЯ ═══

ЗАПРЕЩЕНО завершать turn / писать «готово» / «S31 готова к продолжению» после одной TZ.
После commit+push — СРАЗУ claim следующей TZ из checklist. Без паузы. Без вопроса PO.

Единственные причины STOP:
  (a) все 10 пунктов chain = [x] и closeout checklist [x]
  (b) blocker без обхода (напиши blocker + что пробовал)

Если контекст переполнен: /clear → RESUME:
  tasks/PROMPT-FREEBUFF-SALES-CANON-RESUME.md

═══ ЦИКЛ (повторять до [x] на всех 10) ═══

CLAIM → код → gates → archive → commit+push → отметить [x] в WAVE → СЛЕДУЮЩАЯ TZ

FE TZ: nx build kppdf-web PASS последним.
BE TZ: tsc + focused jest.
Не stage чужой WIP. Не git add -A. Не deploy/wipe.

═══ ПОРЯДОК (пропускай [x]) ═══

 1. S30 CURRENCY-RUB        tasks/TZ-NX-SALES-S30-CURRENCY-RUB.md
 2. S31 ORDER-PAID          tasks/TZ-NX-SALES-S31-ORDER-PAID.md
 3. S32 SITES-ENSURE        tasks/TZ-NX-SALES-S32-SITES-ENSURE.md
 4. S33 PI-ORDERS-CRUD      tasks/TZ-NX-SALES-S33-PI-ORDERS-CRUD.md
 5. S34 ORDERS-LIST         tasks/TZ-NX-SALES-S34-ORDERS-LIST.md
 6. S35 ORDER-DETAIL        tasks/TZ-NX-SALES-S35-ORDER-DETAIL.md
 7. S36 ORDER-CREATE        tasks/TZ-NX-SALES-S36-ORDER-CREATE.md
 8. S37 QUOTATION-CONVERT   tasks/TZ-NX-SALES-S37-QUOTATION-CONVERT.md
 9. S38 STUB-KP-HIDE        tasks/TZ-NX-SALES-S38-STUB-KP-HIDE.md
10. S39 OPERATOR-DOCS       tasks/TZ-NX-SALES-S39-OPERATOR-DOCS.md

═══ CLAIM (каждая TZ, до кода) ═══

1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/<TASK-ID>.md + checklist docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at ISO + workspace
4) Чужие _active keys → STOP
5) git fetch && merge origin/main если чисто

═══ ЗАПРЕТЫ ═══

- Семья КП, авто-резерв склада, statusOverride, Invoice, тендеры
- POST stub-proposal из NX
- Параллель двух TZ на kppdf-web/src/**

═══ ФИНАЛ (только после шага 10) ═══

WAVE все [x] · closeout [x] · _active/ пуст · QUEUE/_NOW · push

═══ END ═══
```
