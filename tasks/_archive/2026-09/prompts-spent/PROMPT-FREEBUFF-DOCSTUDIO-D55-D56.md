# PROMPT — Freebuff: Doc Studio D55→D56 (Data IA-2)

Скопируй агенту **целиком**. One-shot continuous. Без уточнений у PO mid-wave.

---

[КОНТЕКСТ ПРОЕКТА]

Workspace: `D:\kppdf-8.0` · branch: текущий main/work · `agent_id: freebuff`  
Контракт: корневой `GEMINI.md` + skill `.agents/skills/kppdf-executor-loop/SKILL.md`  
Канон: `docs/PO-CANON.md`, `docs/CONTEXT.md` (КП = UI «КП», сущность Quotation ≠ Organization)  
WAVE: `docs/agent-checklists/WAVE-DOCSTUDIO-DATA-IA-2.md`  
TZ по порядку:
1. `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-D55-LINKS-COPY-CLEAR.md`
2. `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL.md`

PO скрин: панель Данные → Связи. Проблемы: хардкод «Коммерческое предложение»; нет пункта сброса в списках; двойной заголовок «Данные»; «Выбрано» унести на левый vertical rail под «Данные».

[ГЛОБАЛЬНАЯ ЗАДАЧА И ШАГИ]

CLAIM первым (до кода) для **каждой** TZ:
1) `Get-Location` + `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
2) `tasks/_active/<TASK-ID>.md` + checklist по `docs/agent-checklists/_TEMPLATE.md`
3) Status CLAIMED; Claim slot: `agent_id: freebuff` + `claimed_at` ISO-8601 + workspace
4) `_active-map` + чужие `_active` keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай `docs/AI-AGENT-GUIDE.md` + TZ и выполни.

Порядок:
1. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 иначе STOP
2. **D55** — label «КП»; empty `value=""` options в Связи/Кому/Ещё; удалить внутренний `.heading` «Данные»; тесты + page.md; gates; Executor report (auto); archive → `_archive/2026-09/*.done.md`; снять `_active`
3. **D56** — claim заново; section `selected`; 2-я left tool «Выбрано» под Данные; optional `badge` на `ShellToolRailItem` + render в app-shell; TOC Данные без «Выбрано»; reuse buffer/insert emitters; A4 без reflow; docs/audit note; gates; archive; обновить `WAVE-DOCSTUDIO-DATA-IA-2.md` + `docs/agent-checklists/_NOW.md` + `tasks/QUEUE-LIVE.md`

Факты file:line (ориентир):
- `studio-data-panel.component.ts` ~32 heading; ~156 «Коммерческое предложение»; TOC selected key
- `select.component.ts` `selectOption(value: string)` — нужен empty option, не новый clearable API
- `studio-editor.page.ts` ~744 left tools только `data`; `ensureLinkedQuotation` effect ~734 — не ломать
- `studio-workspace-chrome.ts` StudioWorkspaceSection

[ЖЕСТКИЕ ОГРАНИЧЕНИЯ]

- CONFLICT KEYS строго по TZ; не трогать backend / putDataSet / Properties / legacy `frontend/`
- No placeholders / «остальное потом» / обрезанный diff
- Не ждать «ок» от PO; STOP только: чужой active kppdf-web, baseline red, irreversible schema
- Параллель второго kppdf-web TZ запрещена
- Frontend-nx: `nx build kppdf-web` **последним** в каждой TZ
- Товары на rail — НЕ делать (только Выбрано)

[ТРЕБУЕМЫЙ ФОРМАТ ОТВЕТА]

1) `<thinking>` план + сверка AC D55 затем D56 `</thinking>`
2) Код в репо + краткий отчёт: SHA, paths, gates exit codes
3) Self-check: архитектура · empty-option edge · KP auto-link known_limitation · A4 · не обрезано · gates
4) `## Executor report (auto)` в каждом checklist (≤15 строк; full 40-char commit SHA) **до** archive

После обеих TZ: одна строка в чат Cursor — `freebuff executor DONE. Look: docs/agent-checklists/TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL.md`
