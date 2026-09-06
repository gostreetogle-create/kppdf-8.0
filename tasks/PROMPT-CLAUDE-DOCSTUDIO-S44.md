# PROMPT — Claude Code: Doc Studio S44 (после Freebuff D56)

Скопируй в Claude Code terminal **только когда** Freebuff закрыл D56  
(`tasks/_active/` без `TZ-NX-DOCSTUDIO-D56*` и `nx build kppdf-web` green).

Если D56 ещё CLAIMED — **STOP**, не пиши код, напиши `WAIT: Freebuff D56 still active`.

---

UNATTENDED (hard) — PO AFK:
- Не спрашивать «продолжать?», «ок?», «commit/push?», «архивировать?».
- Не Plan Mode mid-wave. STOP только wipe/deploy/secrets/schema/чужой active.
- Канон: `docs/agents/CLAUDE-UNATTENDED.md`

---

[КОНТЕКСТ ПРОЕКТА]

Workspace: `D:\kppdf-8.0` · `agent_id: claude`  
Контракт: корневой `GEMINI.md` + `.agents/skills/kppdf-executor-loop/SKILL.md`  
Канон: `docs/PO-CANON.md`, `docs/pages/document-studio.page.md` §2–3  
TZ (SoT): `tasks/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md`  
SIZE: L · один TZ, не клеить Registries/другие волны

Смысл для оператора: клик по таблице с товарами на A4 больше не «пустеет» и не открывает попап ручных строк; ERP-токен на холсте синий (`--color-info`); драг таблицы с данными — с первого клика.

[ГЛОБАЛЬНАЯ ЗАДАЧА И ШАГИ]

**Gate до CLAIM (обязательно):**
```
Get-ChildItem D:\kppdf-8.0\tasks\_active
# должно быть пусто или только .gitkeep — иначе STOP
cd D:\kppdf-8.0\frontend-nx; pnpm exec nx build kppdf-web   # exit 0
```

CLAIM первым (до кода):
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) tasks/_active/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id: claude + claimed_at ISO-8601 + workspace
4) Чужой _active с kppdf-web → STOP
5) Team Room claim best-effort

Затем прочитай TZ целиком и выполни Шаги 1–3:

1. `studioTableRowSource(block)` в `studio-table-defaults.ts`; `table-edit` только если `=== 'manual'`; для catalog/quotation/order — preview + selection-frame (как text/image)
2. CSS `.substitution-token` на холсте → `color: oklch(var(--color-info))`; пробел после вставки токена в `pi-rich-text-editor`; PDF не трогать (цвет не должен уехать в Просмотр)
3. Живая проверка драга (a data-table / b manual / c text|image) → в отчёт

Gates (nx build — последним):
```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio
cd frontend-nx && pnpm exec nx lint kppdf-web
cd frontend-nx && pnpm exec nx build kppdf-web
```

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.done.md`  
Checklist: `## Executor report (auto)` с full 40-char SHA до archive  
В чат Cursor: `claude executor DONE. Look: docs/agent-checklists/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md`

[ЖЕСТКИЕ ОГРАНИЧЕНИЯ]

- CONFLICT KEYS строго из TZ; не трогать Freebuff-зону D56 без нужды (`studio-data-panel`, shell tools) — файлы S44: canvas / table-defaults / table-properties body / rich-text
- НЕ: backend PDF, putDataSet/liveRows write-path, перенос cell-edit в Properties, кнопка «Редактировать» у товаров, Registries TZ
- No placeholders; не ждать «ок» PO mid-wave
- Parallel второй kppdf-web TZ запрещён

[ТРЕБУЕМЫЙ ФОРМАТ]

1) `<thinking>` план + AC `</thinking>`
2) Код в репо + SHA + gates
3) Self-check: manual table popup жив · data table не пустеет · token color · PDF чёрный · drag
4) Executor report (auto) ≤15 строк
