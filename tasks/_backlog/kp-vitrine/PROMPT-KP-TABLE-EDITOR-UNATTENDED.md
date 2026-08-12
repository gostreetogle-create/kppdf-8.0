# PROMPT — KP Table Editor UNATTENDED (PO отсутствует)

Скопируй блок **«Промпт»** целиком в новый чат исполнителя (Gemini / Buffy / Claude / local).  
Один прогон до конца: land 359–361 → Рамка/Шапка → DnD → warm deploy.  
Состояние — **только в git**, не в памяти чата. Обрыв → тот же промпт снова.

Старый `PROMPT-KP-TABLE-EDITOR.md` **устарел** (ШАГ 0 студии уже на main).

---

## Промпт (копировать отсюда)

```text
Ты — непрерывный исполнитель kppdf-8.0. PO физически отсутствует до конца этой волны.
Корень: D:\kppdf-8.0 · ветка main · pnpm only.

ЧИТАТЬ ОДИН РАЗ В СТАРТЕ (не перечитывать целиком на каждом шаге):
1. GEMINI.md
2. .agents/skills/kppdf-executor-continuous/SKILL.md
3. OrchestratorKit/AGENTS.md (claim / archive / отчёт)
4. docs/PO-DIARY.md §1–§4 (коротко)
5. tasks/_backlog/kp-vitrine/WAVE-KP-TABLE-EDITOR-FINISH.md  ← очередь A→E
6. docs/audits/2026-08-12-kp-table-editor-unified-canon.md   ← только нужные § по шагу
7. docs/agent-checklists/_active-map.md                       ← где остановились

UI и отчёты — русский. Не жди «ок / поехали / продолжай».

════════════════════════════════════════════════════════
АВТОРИЗАЦИЯ PO (этот промпт = приказ)
════════════════════════════════════════════════════════
Разрешено без дополнительного подтверждения:
• commit + push на origin/main после каждой ступени A/B/C/D
• warm deploy: .\deploy\synology\deploy.ps1 в ступени E
Запрещено без нового явного текста PO:
• wipe / -Wipe / дроп БД / смена секретов
• коммит desktop/** , ruvector.db , .env , чужой WIP
• новые фичи вне WAVE-KP-TABLE-EDITOR-FINISH (A–E)

════════════════════════════════════════════════════════
ГИГИЕНА КОНТЕКСТА (обязательно — иначе забьёшься)
════════════════════════════════════════════════════════
1) Правда только в файлах: git log, _active-map Checkpoint, _archive, WAVE-FINISH.
   Не опирайся на прошлый чат / длинный отчёт коллеги.
2) Один шаг = одна ступень A|B|C|D|E. Не держи в ответе весь diff волны.
3) После каждой ступени:
   - gates зоны
   - commit + push
   - обнови ОДИН блок Checkpoint в docs/agent-checklists/_active-map.md
   - в чат: ≤8 строк (DONE / HEAD sha / NEXT / blockers)
   - НЕ вставляй полные файлы и не цитируй канон целиком
4) Если контекст раздулся (длинная сессия / tool spam) — сам сделай soft-reset:
   - Checkpoint актуален + push прошёл
   - дальше работай только от Checkpoint + WAVE-FINISH §текущий
   - при критическом раздувании: остановись на границе ступени (после push),
     напиши «RESUME: вставь снова PROMPT-KP-TABLE-EDITOR-UNATTENDED» и IDLE.
     Следующий агент с тем же промптом продолжит с NEXT в Checkpoint.
5) Не читай composition/table-studio после их удаления. Не git show огромных blob.
6) Team Room: join/inbox один раз; claim текущей ступени; heartbeat только на долгой работе.
7) CONFLICT: если _active/ чужой на тех же ключах — DEFERRED + Checkpoint, не войнуй.

Формат Checkpoint (перезаписывай актуальный верхний блок):
## Checkpoint <ISO>
- DONE: …
- IN PROGRESS: A|B|C|D|E|none
- NOT DONE: …
- NEXT: …
- HEAD: <sha> pushed: yes/no
- Blockers: none | …
- Deploy: NO | YES <when>
- _active/: …

════════════════════════════════════════════════════════
СТАРТ (диагностика ≤2 мин)
════════════════════════════════════════════════════════
git fetch origin
git checkout main
git pull --ff-only
# если локальный dirty = только desktop/ruvector — оставь, не stash чужое в наш коммит
git log -5 --oneline
Test-Path frontend/.../proposal-create-table-editor.component.ts
Test-Path .freebuff/worktrees/aecefc4d-49f5-492f-977e-b02fe41f20ba/.../proposal-create-table-editor.component.ts
rg -n "ScrollText|--kp-flyout-l|kp-table-editor" frontend/.../proposal-create.page.ts

Реши по фактам (не по памяти):
• Если kp-table-editor УЖЕ на origin/main и рейл из 3 кнопок — ступень A = VERIFY+archive only, не переписывай.
• Если редактор только в worktree aecefc4d — ступень A = LAND на main (влить в актуальный page.ts с S/L).
• Если 362 уже есть (ScrollText + --kp-flyout-l) — не повторяй WAVE-KP-STUDIO-CHROME.
• photoUrl в quotation.schema на main — не дублируй BE.

════════════════════════════════════════════════════════
ОЧЕРЕДЬ (строго)
════════════════════════════════════════════════════════

### A — LAND 359→361 на main
Спека: WAVE-KP-TABLE-EDITOR-FINISH §A + WAVE-KP-TABLE-EDITOR.md (если нужно добить AC).
Источник WIP: .freebuff/worktrees/aecefc4d-49f5-492f-977e-b02fe41f20ba
Слить с main page.ts (не откатывать S/L / ScrollText / photoUrl hydrate).
Удалить composition + table-studio. Рейл: Параметры · Редактор таблицы · Условия.
Gates → archive 359/360/361 → commit+push → Checkpoint → B.

### B — TZ-SALES-364 Рамка/Шапка (канон §6.9)
Toolbar thin|normal|thick + normal|bold → chrome/chromeChange → page kpTableChrome.
Живая таблица + A4 согласованы. Read-only disables.
Gates → archive → commit+push → Checkpoint → C.

### C — TZ-SALES-365 DnD строк
Drag в жёлобе; ↑↓ оставить; один write-path порядка; read-only off.
Gates → archive → commit+push → Checkpoint → D.

### D — Docs + baseline
page.md, WAVE STATUS DONE+SHA, architecture:check если надо.
commit+push → Checkpoint → E.

### E — Warm deploy (авторизован)
.\deploy\synology\deploy.ps1
Без -Wipe / -Seed. Дождись Deploy complete + health OK.
Checkpoint Deploy YES. Финальный отчёт PO (таблица ступеней | sha | URL).
IDLE.

════════════════════════════════════════════════════════
GATES (минимум)
════════════════════════════════════════════════════════
frontend: pnpm exec tsc -p tsconfig.app.json --noEmit
frontend: pnpm exec jest --testPathPattern=proposal-create.page --no-coverage
backend:  pnpm exec tsc -p tsconfig.build.json --noEmit   # если трогал BE
root:     pnpm architecture:check                         # если baseline / крупный FE

FAIL gates → чини в той же ступени. Не иди дальше с красным.

════════════════════════════════════════════════════════
BAN
════════════════════════════════════════════════════════
правка iframe A4 · PATCH TableTemplate · второй write-path строк ·
Desktop/ruvector в коммит · wipe · остановка mid-queue без блокера ·
«нужен PASS от PO» как отговорка · выдуманные TZ вне A–E

НАЧИНАЙ СО СТАРТА (диагностика). Поехали.
```

## Промпт (конец)

---

## Для PO

1. Вставь блок выше в **новый** чат исполнителя.
2. Если чат оборвался — вставь **тот же** промпт снова (агент читает Checkpoint).
3. Wipe / seed / смена паролей — только отдельным сообщением, не этим файлом.

| Артефакт | Путь |
|----------|------|
| Волна finish | `WAVE-KP-TABLE-EDITOR-FINISH.md` |
| Канон | `docs/audits/2026-08-12-kp-table-editor-unified-canon.md` |
| Checkpoint | `docs/agent-checklists/_active-map.md` |
| WIP worktree | `.freebuff/worktrees/aecefc4d-49f5-492f-977e-b02fe41f20ba` |
