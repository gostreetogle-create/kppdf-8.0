# Промпт — WAVE-PRODUCTION-STUDIO-CHROME (Цех / Гант studio → 98–99)

Скопируй агенту **целиком**. Один промпт = фазы **A closeout → B → C → D**.  
При обрыве интернета: вставь **тот же** промпт снова — агент читает master checklist и продолжает с первого незакрытого `[ ]`.

Deploy / wipe **не** запускать. Не ждать «ок / поехали» mid-queue.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main (или явный task-worktree).
Skills: .agents/skills/kppdf-executor-loop/SKILL.md (+ continuous alias) · GEMINI.md
Канон PO: docs/PO-CANON.md
SoT FROZEN: docs/ux/production-gantt-studio-spec.md
Аудит: docs/audits/2026-08-15-production-studio-plan-review.md
Wave: tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md
MASTER CHECKLIST (источник правды при resume):
  docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md

Цель: довести /production (план-оценка) до PO visual 98–99/100.
«100» допустим только как estimate-only studio PASS; факт производства = 0 и не в scope.

════════════════════════════════════════════════════════
ПРАВИЛА ДВИЖЕНИЯ
════════════════════════════════════════════════════════
1) Сначала открой MASTER checklist. Обнови live resume slot. Найди первую
   незакрытую фазу. Не переоткрывай DONE фазы.
2) Порядок СТРОГИЙ: A-closeout → B → C → D → WAVE DONE. Не параллелить B||C.
3) На каждой TZ: создать/заполнить per-TZ checklist → CLAIM tasks/_active/
   → код только по CONFLICT KEYS → AC → gates → Executor report (auto) →
   archive + lock → remove _active → commit+push (GIT-POLICY) → отметить
   MASTER phase [x] + score_now → next.
4) После КАЖДОГО осмысленного шага (и перед выходом) пиши в MASTER:
   last_phase / last_tz / last_action / blocked / score_now / next_action /
   updated_at / agent. Это защита от обрыва сети.
5) UI RU. Слова экрана: Цех, Гант, Виды работ, Заказы, Фильтры, Обновить,
   Карточка, Сегодня, Масштаб, Сброс фильтров.
6) Жёсткий split:
   Заказы = список + поиск + select + Все активные;
   Фильтры = active-only + приоритет + даты + Сброс фильтров.
7) PiGroupWorkspace = только section chrome. Rails/flyout = LOCAL production
   shell. Не тащить Gantt state в PiGroupWorkspace. Не изобретать shared
   StudioRail в этой волне.
8) BAN: WorkType.days math rewrite; ProductionReadFacade API rewrite;
   gantt-bar estimate formula; backend new endpoints; drag-reschedule;
   check-in; ProductionSchedule; ProductionOrder; TZ-309 writes;
   park 308/310 поверх СТАРОГО docked layout; deploy; wipe.
9) Звать PO только на реальном блокере (секреты, чужой CONFLICT в _active,
   невозможный AC). Не останавливаться за visual PASS mid-queue — evidence
   сам кладёшь в checklist (в т.ч. getBoundingClientRect в D).

════════════════════════════════════════════════════════
СТАРТ (каждый запуск / resume)
════════════════════════════════════════════════════════
git status --short --branch
Прочитай: MASTER checklist · SoT · WAVE · tasks/_active/ · этот промпт.
Если last_phase/score_now уже в MASTER — продолжай с next_action, не с нуля.
Team Room join/inbox если доступен (не блокер).

════════════════════════════════════════════════════════
ОЧЕРЕДЬ
════════════════════════════════════════════════════════

0) PHASE A CLOSEOUT (docs only) — tasks/TZ-PRODUCTION-STUDIO-A-spec.md
   Если A уже в _archive/*.done.md — отметь MASTER A [x] score+=15 и skip.
   Иначе:
   - Добить словарь search→Заказы в SoT если ещё нет.
   - Checklist A → archive
     tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md
   - Удалить tasks/_active/TZ-PRODUCTION-STUDIO-A.md
   - MASTER: A [x], score_now=15
   Product-код в фазе A ЗАПРЕЩЁН.

A) TZ-PRODUCTION-STUDIO-B-shell.md — behavior-preserving shell
   Self-verify:
   - PiGroupWorkspace + chips Гант|Виды работ; flushBody
   - local leftTool/rightTool API; one-flyout invariant в тесте
   - docked UI ещё может быть (до C), но select/filters/zoom/refresh/?orderId= 1:1
   - PiGroupWorkspace НЕ знает Gantt/inspector
   Gates: frontend tsc; jest src/app/pages/production; diff-check
   MASTER: B [x], score_now≈40

B) TZ-PRODUCTION-STUDIO-C-visual.md — rails + flyout
   Self-verify:
   - нет w-56/w-14 docked; нет text toolbar над Гантом
   - 48|center|48; L: Заказы/Фильтры/Обновить; R: Карточка/Сегодня/Масштаб
   - один flyout; Escape/backdrop; focus return
   - Заказы≠Фильтры split
   - поведение 1:1
   Gates: как выше + точечные specs rail/inspector
   MASTER: C [x], score_now≈75

C) TZ-PRODUCTION-STUDIO-D-closeout.md — geometry 98–99
   Self-verify:
   - 1920 light+dark: getBoundingClientRect center width unchanged open/close
   - нет double scroll / clip / docked 20rem
   - tree/focus/non-color OK
   - /work-types = Цех chrome parity (без CRUD rewrite)
   - SECTION-READINESS: studio estimate PASS; факт out
   - safe 308/310 только если дыры; НЕ 309
   Gates + WAVE STATUS DONE + SHA table
   MASTER: D [x], score_now≥98, last_phase=DONE

D) ВОЛНА DONE
   - _active пуст по STUDIO-A/B/C/D
   - все в _archive/2026-08
   - Отчёт PO: таблица TZ|SHA|archive|score + known_limitation
   - Deploy НЕ запускать
   - STOP

════════════════════════════════════════════════════════
GATES (каждая product-TZ B/C/D)
════════════════════════════════════════════════════════
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/pages/production --runInBand --no-coverage
prettier/eslint по зоне; git diff --check
Commit+push после каждой закрытой TZ (если remote/policy позволяют; иначе
честно в checklist: push deferred + причина).

════════════════════════════════════════════════════════
SELF-SCORE RUBRIC (пиши в MASTER)
════════════════════════════════════════════════════════
15  A spec archived
40  B shell wrap + local tools API + no facade rewrite
75  C visual studio rails/flyout + mapping
90  D a11y/tree + work-types parity
98  geometry rect evidence light+dark @1920
99  readiness/docs/WAVE DONE; факт цеха явно out
100 только если PO отдельно принял estimate-only экран как полный PASS
    (не выдавай себе 100 без этой отметки PO)

Если self-verify FAIL — чини в той же TZ. Не архивируй с дырой.
```

## Для PO (одна строка выдачи)

```text
Выполни tasks/_backlog/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md целиком. Resume по docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md. Цель 98–99. Deploy не трогать.
```
