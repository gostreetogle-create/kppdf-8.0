# Промпт — WAVE-PRODUCTION-COCKPIT-HARDEN (Цех → 98–99)

Скопируй агенту **целиком**. Один промпт = фазы **324 → 325 → 326 → 327 → 328**.  
При обрыве: вставь **тот же** промпт снова — агент читает MASTER checklist и продолжает с первого незакрытого `[ ]`.

Deploy / wipe **не** запускать. Не ждать «ок / поехали» mid-queue.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main
(или явный task-worktree по GIT-POLICY).
Skills: .agents/skills/kppdf-executor-loop/SKILL.md · GEMINI.md
Канон PO: docs/PO-CANON.md

SoT / входы (прочитай в этом порядке):
1) docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md   ← MASTER resume
2) docs/audits/2026-08-15-production-cockpit-harden-audit.md
3) tasks/_backlog/WAVE-PRODUCTION-COCKPIT-HARDEN.md
4) docs/pages/production-cockpit.page.md
5) этот промпт

Уже DONE (не переоткрывать): WAVE-GANTT-TREE 314–320, CASCADE 321–323
(каскад на Ганте без нижней Карточки — сохранить поведение).

Цель: /production план-оценка студия → PO visual+sync **98–99/100**.
Факт производства = OUT. «100» только если estimate studio полностью зелёная
и доки SoT; не означает fact shop-floor.

════════════════════════════════════════════════════════
ПРАВИЛА ДВИЖЕНИЯ
════════════════════════════════════════════════════════
1) Открой MASTER checklist. Обнови live resume. Первая незакрытая фаза —
   единственная работа. Не переоткрывай DONE.
2) Порядок СТРОГИЙ: 324 → 325 → 326 → 327 → 328 → WAVE DONE.
3) На каждой TZ:
   per-TZ checklist → CLAIM tasks/_active/ → код только CONFLICT KEYS →
   AC → gates (tsc + jest зоны) → Executor report → archive + lock →
   убрать _active → commit+push (GIT-POLICY) → MASTER [x] + score_now +
   next_action.
4) После КАЖДОГО осмысленного шага и перед выходом пиши в MASTER live slot:
   last_phase / last_tz / last_action / blocked / score_now / next_action /
   updated_at / agent. Это защита от обрыва сети.
5) UI только RU. Слова: Цех, Гант, Заказы, Заказчики, Фильтры, Обновить,
   Сегодня, Масштаб, День, Неделя, Вместить сроки (не «Весь горизонт»).
6) BAN: deploy; wipe; fact ProductionOrder/OrderTask; new BE endpoints
   без STOP+вопрос PO; stage data/paspots и чужой WIP; mid-queue «можно?».
7) Звать PO только на реальном блокере (секреты, чужой CONFLICT в _active,
   API отвергает plannedDate с evidence). Visual PASS mid-queue — сам
   фиксируй evidence в checklist.

════════════════════════════════════════════════════════
СТАРТ (каждый запуск / resume)
════════════════════════════════════════════════════════
git status --short --branch
Прочитай MASTER · audit · WAVE · tasks/_active/ · этот промпт.
Если last_tz/next_action уже в MASTER — продолжай с next_action, не с нуля.
Team Room join/inbox если доступен (не блокер).

════════════════════════════════════════════════════════
ОЧЕРЕДЬ
════════════════════════════════════════════════════════

324) tasks/TZ-PRODUCTION-324-gantt-zoom-fit.md
     Checklist: docs/agent-checklists/TZ-PRODUCTION-324.md
     — week fit-width (px/day от ширины timeline)
     — «Вместить сроки» = range по bars + fit density (не no-op)
     — «Сегодня» = today в range + scroll к маркеру
     Gates: frontend tsc; jest gantt-bars + production-cockpit
     MASTER: 324 [x], score_now≈82

325) tasks/TZ-PRODUCTION-325-orders-rail-counterparties.md
     Checklist: docs/agent-checklists/TZ-PRODUCTION-325.md
     — убрать status-pips в flyout Заказы
     — режим/секция Заказчики (Counterparty) → filter Gantt
     — verify date filters на Gantt
     MASTER: 325 [x], score_now≈88

326) tasks/TZ-PRODUCTION-326-gantt-write-sync.md
     Checklist: docs/agent-checklists/TZ-PRODUCTION-326.md
     — матрица write-paths; plannedDate Save/drag → bars движутся
     — canEditOrder для meta+drag plannedDate; catalog = production:write
     — BE verify only; STOP если API реально ломает
     MASTER: 326 [x], score_now≈93

327) tasks/TZ-PRODUCTION-327-cockpit-smart-dumb.md
     Checklist: docs/agent-checklists/TZ-PRODUCTION-327.md
     — inventory smart/dumb; 1–3 focused extracts; no UX rewrite
     MASTER: 327 [x], score_now≈96

328) tasks/TZ-PRODUCTION-328-cockpit-docs-closeout.md
     Checklist: docs/agent-checklists/TZ-PRODUCTION-328.md
     — production-cockpit.page.md полный SoT страницы
     — sync production-gantt-studio-spec.md (нет bottom card)
     — PAGE-TZ-INDEX + WAVE DONE + _NOW
     MASTER: 328 [x], score_now=98 или 99, WAVE DONE

════════════════════════════════════════════════════════
ФИНИШ
════════════════════════════════════════════════════════
Когда все фазы [x] и очередь пуста:
1) MASTER: score_now ≥ 98; next_action = STOP
2) Короткий отчёт PO: архивы 324–328, score, «готово предложить деплой»
3) НЕ деплоить. Остановись.

Если оборвался интернет — следующий запуск с ЭТИМ ЖЕ промптом;
продолжай с MASTER next_action.
```

## Как выдать

1. Новый чат агента-исполнителя (Gemini / Cursor Agent Mode B).  
2. Вставь блок ` ```text ` … ` ``` ` выше.  
3. При обрыве — тот же текст ещё раз.  
4. Деплой — отдельной фразой PO: «деплой» / «кати».
