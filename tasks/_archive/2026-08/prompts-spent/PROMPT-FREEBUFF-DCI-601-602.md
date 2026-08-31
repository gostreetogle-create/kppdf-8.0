# PROMPT — один Freebuff: вся волна DCI (602→601)

> **Скопируй блок ниже целиком** в Freebuff / Buffy / Claude CLI.
> Один агент · одна сессия (или resume по чеклисту) · PO не выдаёт TZ по одной.

```text
Ты — continuous executor kppdf-8.0. Репо: D:\kppdf-8.0 (main, не Isolated).
Skill: .agents/skills/kppdf-executor-loop/SKILL.md
Обязательно: GEMINI.md · docs/PO-CANON.md · docs/ui-rules.md · docs/DARK-THEME.md
Аудит волны: docs/audits/2026-08-31-dark-control-interface-audit.md

════════════════════════════════════════
ШАГ 0 — СВОЙ MASTER-ЧЕКЛИСТ (ДО ЛЮБОГО КОДА)
════════════════════════════════════════
Сразу создай/обнови файл:
  docs/agent-checklists/WAVE-DCI-601-602.md

Формат — твой, но ОБЯЗАТЕЛЬНО:
- Status сверху: IN_PROGRESS | DONE
- agent_id + started_at (ISO)
- Секция «RESUME»: одна строка «сейчас открыт пункт N» (обновляй после каждого пункта)
- Нумерованный список ВСЕЙ волны с [ ] / [x]
- Под каждым TZ: Claim / Code / Gates / Archive / Commit
- В конце: «очередь DCI пуста» + HEAD sha

Если файл уже есть (связь оборвалась) — НЕ начинай с нуля:
1) прочитай WAVE-DCI-601-602.md
2) найди первый незакрытый [ ]
3) продолжи с него
4) не переспрашивай PO «продолжать?»

════════════════════════════════════════
ОЧЕРЕДЬ (строго по порядку, без паузы на PO)
════════════════════════════════════════
1) TZ-UI-DCI-602  → tasks/TZ-UI-DCI-602-focus-segmented.md
2) TZ-UI-DCI-601  → tasks/TZ-UI-DCI-601-flow-diagram.md

После DONE обоих: обнови tasks/QUEUE-LIVE.md (DCI DONE) и docs/agent-checklists/_NOW.md.
603–605 НЕ делать (backlog). DocStudio S8 НЕ трогать. Deploy/wipe НЕ делать.

════════════════════════════════════════
ПРАВИЛА ЦИКЛА НА КАЖДУЮ TZ
════════════════════════════════════════
A. CLAIM до кода:
   - tasks/_active/<TZ-ID>.md (копия/ссылка на спеку)
   - claim slot в docs/agent-checklists/<TZ-ID>.md (шаблоны уже есть: 602/601)
   - обнови RESUME в WAVE-DCI-601-602.md

B. Код только frontend-nx (не legacy frontend/):
   - 602: global.css + kit + docs; НЕ global :focus-visible outline
     (уже .pi-focus-ring + --focus-ring-shadow). Tri-state segmented = bg+border+ink.
   - 601: PiFlowDiagram в paper-and-ink + kit demo RU
     (Заказ→Снабжение→Цех→Отгрузка); gold-deep pulse; ResizeObserver;
     reduced-motion; НЕ violet/ice/Onest/canvas.

C. Gates (последняя команда всегда build):
   cd frontend-nx && pnpm exec nx build kppdf-web
   Для 601 ещё: nx test paper-and-ink --testPathPattern=flow-diagram

D. Archive:
   tasks/_archive/2026-08/<TZ-ID>.done.md
   очисти tasks/_active/
   [x] в WAVE + checklist TZ
   commit+push по docs/GIT-POLICY.md (executor claimed → после gates)

E. Сразу следующая TZ — без «можно дальше?»

Стоп ТОЛЬКО: wipe/deploy/секреты/архитектурный конфликт с PO-каноном.
Не параллелить второй agent на apps/kppdf-web/src/**

════════════════════════════════════════
КОНЕЦ СЕССИИ
════════════════════════════════════════
Когда оба TZ archived и WAVE Status=DONE:
короткий отчёт PO одной строкой:
«DCI 602+601 DONE · archives … · HEAD … · очередь DCI пуста · S8 всё ещё PARK»
Стоп. Жди новую очередь или команду деплоя.
```
