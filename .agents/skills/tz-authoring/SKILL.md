---
name: tz-authoring
description: >-
  Writes executable TZ specs for kppdf-8.0 local agents. Use when PO asks for a
  TZ, task spec, acceptance criteria, conflict keys, or work for Gemini/local AI.
  ALWAYS read docs/TZ-AUTHORING.md (domain preflight) before drafting any TZ.
---

# TZ Authoring (Cursor)

Пиши задачи так, чтобы локальный агент выполнил их без уточнений. Код не пиши.

**ОБЯЗАТЕЛЬНО перед черновиком TZ:** прочитай и примени
[`docs/TZ-AUTHORING.md`](../../docs/TZ-AUTHORING.md)
(канон имён, unique/кардинальность, preflight checklist). Без § Domain preflight
не отдавай TZ исполнителю.

Источники спеки: запрос PO, архитектурный риск, **или UX/business smell**
(дубли UI, лишние шаги, нелогичные статусы) — смотри как будущий пользователь ERP.

Если PO описал фичу расплывчато — **grilling до TZ** (правило `planning-grilling.mdc`):
цель, не-цели, 3–7 вопросов, термины в `docs/CONTEXT.md`. Не PRD и не GitHub Issue.
Сложное / новая идея / архитектура — **MCP `claude_code` analysis-only до черновика TZ**.

## Шаблон и эталон

- **Канон написания (SoT):** `docs/TZ-AUTHORING.md`
- Скелет секций: `OrchestratorKit/_templates/TZ-template.txt`
- Качество эталона: `tasks/_backlog/z-series/backend/inventory/Z-001-inventory-write-transactions.md`

## Domain preflight (кратко — детали в TZ-AUTHORING.md)

1. Клиент/покупатель = **Counterparty**, не Organization.
2. Unique обычно на **номере** документа, не на FK клиента.
3. Зафиксируй «Проверено: …» (schema / data-model / vision).
4. Явные НЕ / known_limitation.
5. Спор имён в dictation → одна строка «loose wording → код-канон».

## Обязательные поля

1. Заголовок `TZ-ID: краткое название`
2. `РОЛЬ АГЕНТА`, `ЗАВИСИМОСТИ`, `LAYER`, `CONFLICT KEYS` (пути через `;`)
3. `ИСХОДНОЕ СОСТОЯНИЕ` — факты по коду (файлы/строки), не общие слова
4. `ЧТО ДЕЛАТЬ` — 2–7 шагов с под-шагами
5. `ИЗМЕНЯТЬ` / `НЕ ИЗМЕНЯТЬ`
6. `КРИТЕРИИ ПРИЁМКИ` — измеримые; явные `pnpm` команды для зоны
7. Указание финализации: root → `tasks/_archive/YYYY-MM/` + `GEMINI.md`; kit → TZF-00

## Split rule

- >7 шагов → несколько TZ с DEPENDENCIES
- >1 Layer-3 hot file в конфликте с параллелью → отдельные TZ или DEFER note

## Куда класть

| Место | Когда |
|---|---|
| `tasks/TZ-*.md` | PO готов выдать исполнителю сейчас |
| `tasks/_backlog/` | park / initiative (напр. z-series) |
| Индекс | новые active — строка в `tasks/README.md` + `_active-map` при stream |

Не дублируй уже существующий TZ: сначала `tasks/` + `_archive/2026-08/`.

## Page tagging (обязательно для UI/IA TZ)

В шапке TZ указывай:

```
PAGES: /route1 ; /route2
PAGE_DOCS: foo.page.md ; bar.page.md
```

После создания/закрытия — строка в [`docs/pages/PAGE-TZ-INDEX.md`](../../docs/pages/PAGE-TZ-INDEX.md).

## Verification block (обязателен в AC)

Укажи релевантное, например:

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- <pattern>
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

## Ответ PO после написания TZ

1. Путь к файлу
2. Conflict keys (кратко)
3. Кому отдавать (backend/frontend) и deps
4. **Handoff-промпт обязан начинаться с CLAIM-блока** (иначе агент пропустит бронь):

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/<TASK-ID>.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + <TZ path> и выполни TZ.
Archive только после Cursor/PO PASS если TZ требует review.
```

5. One-liner для PO: «Скопируй промпт агенту; доска `_active-map`.»

Канон дыр: `docs/audits/2026-08-04-agent-ops-claim-gaps.md`.

## Executor report (auto) — required before archive

Last step before archiving the TZ: append `## Executor report (auto)`
to `docs/agent-checklists/<id>.md` with exactly 5 fields. The block MUST
be ≤15 lines. No report → no archive.

Field-name convention:
- Single-commit TZ: `commit: <40-char full SHA>` (e.g. Z-001).
- Multi-commit TZ (feat + closeout): `commits: <40-char full SHA> (feat)
  + <40-char full SHA> (closeout)`.
Use `git rev-parse <short>` to always emit the full 40-char form; never
use 7-char short hashes — Cursor's `git show <sha>` accepts both but
audit-trail discipline prefers full matches.

**Section-size cap** (peer-reviewed convention, prevents TZ-DOC-321
jest-stdout / TZ-DOC-323 probe-records bloat repeating):
- Status / decision sections (e.g. `## Outcome`, `## Executor report`,
  `## Ask`): **≤15 lines**.
- Verification-evidence sections (`## Gates`, `## Diff scope`): **≤30
  lines**. If longer, move verbatim output to `docs/agent-checklists/
  evidence/<id>.txt` and cite by path from the gates table.
