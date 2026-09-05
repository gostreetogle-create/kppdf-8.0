# PROMPT — Claude Code continuous: S44 → Registries scroll

Скопируй агенту **целиком**. Одна сессия до конца цепочки. Не останавливайся mid-wave. Не спрашивай PO «продолжать?».

---

UNATTENDED (hard) — PO AFK:
- Не спрашивать «продолжать?», «ок?», «сделать commit/push?», «можно архивировать?», «перейти к следующей TZ?».
- Не Plan Mode / не ждать approve плана.
- Permission UI: уже bypass/allowlist в `.claude/settings.local.json`; не останавливать цепочку ради чат-подтверждения.
- STOP только: wipe, deploy без явной команды PO, secrets, irreversible schema, чужой `_active` / conflict keys.
- WAVE до конца → Executor report (auto) на каждую TZ → одна строка DONE в чат Cursor.
- Канон: `docs/agents/CLAUDE-UNATTENDED.md` + skill `kppdf-executor-loop`.

---

[КОНТЕКСТ ПРОЕКТА]

Workspace: `D:\kppdf-8.0` · `agent_id: claude`  
Контракт: `GEMINI.md` + `.agents/skills/kppdf-executor-loop/SKILL.md`  
Канон: `docs/PO-CANON.md` · `docs/PO-SHARED-UNDERSTANDING.md` §2 (necessity) · `docs/TZ-NX-BUILD-INTEGRITY.md`  
WAVE SoT: `docs/agent-checklists/WAVE-CLAUDE-S44-REGISTRIES.md`

Freebuff Data IA-2 **DONE** (`efb647b8` / `3792c773`). `_active/` должен быть пуст (только `.gitkeep`) до твоего Claim.

LIVE-цепочка (это **вся** текущая executable очередь; backlog не трогать):

| # | SIZE | TZ | Path |
|---|------|-----|------|
| 1 | L | S44 table canvas select + ERP token color | `tasks/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md` |
| 2 | S | Registries expand — scroll stable + white gap | `tasks/_ready/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md` |

НЕ брать: `tasks/_backlog/**` (G12 park, legacy Gantt delete, density на `frontend/`, DCI-601/602 legacy), Invoice, cutover, `/desk`, второй Doc Studio invent.

[ГЛОБАЛЬНАЯ ЗАДАЧА И ШАГИ]

### ШАГ 0 — Чеклист волны (до любого product-кода)

1. `Get-Location` + `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
2. `Get-ChildItem tasks\_active` — только `.gitkeep`, иначе STOP
3. Обнови `docs/agent-checklists/WAVE-CLAUDE-S44-REGISTRIES.md`: Status S44=CLAIMING, REG=queued
4. Обнови `docs/agent-checklists/_NOW.md` + `tasks/QUEUE-LIVE.md`: Claude IN PROGRESS на цепочке
5. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0

### ШАГ 1 — S44 (полная TZ)

CLAIM:
- `tasks/_active/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md`
- checklist `docs/agent-checklists/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md` по `_TEMPLATE.md`
- Claim slot: `agent_id: claude`, `claimed_at` ISO-8601, workspace

Выполни TZ целиком (Шаги 1–3 в файле):
- `studioTableRowSource` + `table-edit` **только** `manual`; data-source таблицы = preview + selection-frame
- `.substitution-token` на холсте → `oklch(var(--color-info))`; пробел после вставки токена; PDF не красить
- Живая проверка drag a/b/c → в отчёт

Gates (build **последним**):
```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio
cd frontend-nx && pnpm exec nx lint kppdf-web
cd frontend-nx && pnpm exec nx build kppdf-web
```
`## Executor report (auto)` с **full 40-char SHA** → archive `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.done.md` → снять `_active` → commit/push по GIT-POLICY → WAVE: S44=DONE

### ШАГ 2 — REG-SCROLL (сразу после archive S44)

CLAIM заново (новый marker + checklist):
- TZ: `tasks/_ready/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`
- Conflict: `registries-page.ts` (+ router scroll только если доказано); НЕ studio/**

Сделай AC TZ:
- сохранить/восстановить `scrollTop` scrollport при expand/collapse master-строки
- убрать огромную белую пустоту под последним реестром (измерить причину, не гадать)
- URL `/registries/:key` и один expand — без регресса
- цветные категории / redesign — НЕ трогать

Gates:
```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=registries
cd frontend-nx && pnpm exec nx lint kppdf-web
cd frontend-nx && pnpm exec nx build kppdf-web
```
Executor report (auto) → archive `tasks/_archive/2026-09/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.done.md` → `_active` clear → WAVE DONE → `_NOW.md`: Claude IDLE, Freebuff IDLE, NEXT=пусто / ждём PO

### ШАГ 3 — Финальный отчёт в чат Cursor

Одна строка:
`claude executor DONE. Look: docs/agent-checklists/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`  
(+ кратко SHA S44 и REG)

[ЖЕСТКИЕ ОГРАНИЧЕНИЯ]

- Между S44 и REG: только sequential; второй `kppdf-web` active = STOP
- No placeholders / «остальное потом» / уход в backlog
- Не ждать «ок» PO; STOP только: чужой active, baseline red, irreversible schema
- Mode A Cursor не чинит — ты executor
- D55/D56 уже DONE — не переоткрывать

[ТРЕБУЕМЫЙ ФОРМАТ]

1) `<thinking>` план всей цепочки + AC обеих TZ `</thinking>`
2) ШАГ 0 чеклист → код S44 → archive → код REG → archive
3) Self-check на каждую TZ: conflict keys · gates · A4/geometry (S44) · scroll (REG) · не обрезано
4) Executor report (auto) ≤15 строк на каждую TZ, full SHA
