# PROMPT — Freebuff #2: backend-волна (после RBAC)

> **Скопируй блок ниже целиком** во второго Freebuff.
> Один агент · одна сессия (или resume по своему WAVE-чеклисту) · TZ сам по очереди, без паузы на PO.
> Freebuff #1 (DCI) не трогать. RBAC уже DONE — не переоткрывать.

```text
Ты — continuous executor kppdf-8.0. Репо: D:\kppdf-8.0 (main, не Isolated).
Skill: .agents/skills/kppdf-executor-loop/SKILL.md
Обязательно: GEMINI.md · docs/PO-CANON.md · docs/GIT-POLICY.md

Ты — Freebuff #2 (backend). Параллельно другой агент делает DCI на frontend-nx —
НЕ трогай: frontend/**, frontend-nx/**, docker-compose.yml, DocStudio S8,
RBAC guard/JWT (уже DONE: b3607871).

════════════════════════════════════════
ШАГ 0 — СВОЙ MASTER-ЧЕКЛИСТ (ДО ЛЮБОГО КОДА)
════════════════════════════════════════
Сразу создай/перезапиши своим содержимым файл:
  docs/agent-checklists/WAVE-BACKEND-POST-RBAC.md

Формат — твой, но ОБЯЗАТЕЛЬНО:
- Status сверху: IN_PROGRESS | DONE
- agent_id + started_at (ISO)
- Секция «RESUME»: одна строка «сейчас открыт пункт N» (обновляй после каждого шага)
- Нумерованный список ВСЕЙ волны с [ ] / [x]:
    0. Master-чеклист
    1. TZ-BACKEND-VALIDATION-NESTED-I18N
    2. TZ-BACKEND-CATALOG-PART-BOM-IN-TREE
    3. QUEUE-LIVE + _NOW + отчёт PO
- Под каждым TZ: Claim / Code / Gates / Archive / Commit (свои [ ]/[x])
- Conflict: свои keys vs чужой frontend-nx
- В конце при DONE: «очередь BE wave пуста» + HEAD sha

Если файл уже есть (связь оборвалась) — НЕ начинай с нуля:
1) прочитай WAVE-BACKEND-POST-RBAC.md
2) найди первый незакрытый [ ]
3) продолжи с него
4) не переспрашивай PO «продолжать?»

════════════════════════════════════════
ОЧЕРЕДЬ (строго по порядку, без паузы на PO)
════════════════════════════════════════
1) TZ-BACKEND-VALIDATION-NESTED-I18N
   Spec: tasks/TZ-BACKEND-VALIDATION-NESTED-I18N.md
   Checklist TZ: docs/agent-checklists/TZ-BACKEND-VALIDATION-NESTED-I18N.md
   Суть: в main.ts exceptionFactory — flatten err.children + humanize RU
         для nested (overrideDimensions.unit); flat A2 и TZ-DOC-323 category
         не ломать.

2) TZ-BACKEND-CATALOG-PART-BOM-IN-TREE
   Spec: tasks/TZ-BACKEND-CATALOG-PART-BOM-IN-TREE.md
   Checklist TZ: docs/agent-checklists/TZ-BACKEND-CATALOG-PART-BOM-IN-TREE.md
   Суть: в Product/Module tree (buildNode) показать BOM Детали одним уровнем;
         НЕ менять getChildren / maxDescendantDepth (cycle/depth для add).

После DONE обеих: обнови tasks/QUEUE-LIVE.md и docs/agent-checklists/_NOW.md
(BE wave DONE). Чужой DCI WIP в коммиты не класть. Deploy/wipe НЕ делать.

════════════════════════════════════════
ПРАВИЛА ЦИКЛА НА КАЖДУЮ TZ
════════════════════════════════════════
A. CLAIM до кода:
   - tasks/_active/<TZ-ID>.md
   - claim slot в docs/agent-checklists/<TZ-ID>.md (создай/заполни)
   - обнови RESUME в WAVE-BACKEND-POST-RBAC.md

B. Код только по CONFLICT KEYS из спеки. Читай спеку целиком перед кодом.

C. Gates (минимум):
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- <pattern из TZ>
   cd backend && pnpm test
   Target eslint на touched-файлах — 0 errors.
   Full-repo lint baseline вне scope — OK, зафиксируй в archive.

D. Archive:
   tasks/_archive/2026-08/<TZ-ID>.done.md
   ## Executor report (auto) в checklist TZ
   очисти tasks/_active/ от СВОЕГО маркера (не чужой TZ-UI-DCI-601)
   [x] в WAVE + checklist TZ
   commit+push по docs/GIT-POLICY.md (только свои файлы)

E. Сразу следующая TZ — без «можно дальше?» / без ожидания PO.

Стоп ТОЛЬКО: wipe / deploy / секреты / архитектурный конфликт с PO-каноном.

════════════════════════════════════════
КОНЕЦ СЕССИИ
════════════════════════════════════════
Когда обе TZ archived и WAVE Status=DONE:
одна строка PO:
«BE POST-RBAC DONE · nested-i18n + part-BOM-in-tree · HEAD … · frontend не трогал»
Стоп. Жди новую очередь.
```
